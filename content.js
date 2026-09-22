(function () {
  // ---------- Base data ----------
  const FIRST_NAMES = [
    "John", "James", "Michael", "David", "Robert", "William", "Emily",
    "Emma", "Olivia", "Sophia", "Ava", "Isabella", "Daniel", "Matthew",
    "Andrew", "Laura", "Jessica", "Chris", "Amanda", "Kevin"
  ];
  const LAST_NAMES = [
    "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
    "Davis", "Garcia", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
    "Jackson", "Martin", "Lee", "Perez", "White", "Harris"
  ];
  const CITY_ZIP = [
    { city: "New York", zip: "10001", state: "NY" },
    { city: "Los Angeles", zip: "90001", state: "CA" },
    { city: "Chicago", zip: "60601", state: "IL" },
    { city: "Houston", zip: "77001", state: "TX" },
    { city: "Phoenix", zip: "85001", state: "AZ" },
    { city: "Philadelphia", zip: "19101", state: "PA" },
    { city: "San Antonio", zip: "78201", state: "TX" },
    { city: "San Diego", zip: "92101", state: "CA" },
    { city: "Dallas", zip: "75201", state: "TX" },
    { city: "Austin", zip: "73301", state: "TX" }
  ];
  const STREETS = ["Main St", "Oak Ave", "Maple St", "Cedar Ave", "Park Rd", "Elm St", "Washington Ave"];
  const COMPANIES = ["Acme Inc.", "Globex Corp.", "Initech LLC", "Umbrella Co.", "Stark Industries"];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

  function randomBirthdate() {
    const year = 1960 + Math.floor(Math.random() * 45); // 1960-2004
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Consistent data across the entire page (same name/city wherever they appear)
  const session = (() => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const place = pick(CITY_ZIP);
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      address: `${1 + Math.floor(Math.random() * 999)} ${pick(STREETS)}`,
      city: place.city,
      zip: place.zip,
      state: place.state,
      phone: `${digits(3)}-${digits(3)}-${digits(4)}`,
      company: pick(COMPANIES),
      birthdate: randomBirthdate()
    };
  })();

  // ---------- Field recognition ----------
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // removes accents
  }

  function getLabelText(el) {
    let text = "";
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) text += " " + lbl.textContent;
    }
    const closestLabel = el.closest("label");
    if (closestLabel) text += " " + closestLabel.textContent;
    return text;
  }

  function fingerprint(el) {
    const parts = [
      el.name, el.id, el.placeholder, el.getAttribute("aria-label"),
      el.getAttribute("autocomplete"), el.type, getLabelText(el)
    ];
    return normalize(parts.join(" "));
  }

  const SKIP_TYPES = new Set([
    "hidden", "submit", "button", "reset", "image", "file", "checkbox", "radio", "password"
  ]);

  const RULES = [
    { type: "email", keys: ["email", "e-mail"] },
    { type: "birthdate", keys: ["birthdate", "birth date", "date of birth", "dob"] },
    { type: "lastName", keys: ["lastname", "last name", "surname", "family name"] },
    { type: "fullName", keys: ["fullname", "full name", "your name"] },
    { type: "firstName", keys: ["firstname", "first name", "given name"] },
    { type: "phone", keys: ["phone", "mobile", "telephone", "tel"] },
    { type: "zip", keys: ["zip", "postal", "postcode"] },
    { type: "state", keys: ["state", "province", "region"] },
    { type: "city", keys: ["city", "town"] },
    { type: "company", keys: ["company", "organization", "business name"] },
    { type: "address", keys: ["address", "street"] }
  ];

  function classify(el) {
    if (el.disabled || el.readOnly) return null;
    if (el.tagName === "INPUT" && SKIP_TYPES.has((el.type || "").toLowerCase())) return null;

    const fp = fingerprint(el);
    for (const rule of RULES) {
      if (rule.keys.some((k) => fp.includes(k))) {
        return rule.type === "skip" ? null : rule.type;
      }
    }
    return null;
  }

  // Real alias created via SimpleLogin API, injected by popup.js before this
  // script runs. Falls back to null (field left untouched) if none is set,
  // e.g. no API key configured or the API call failed.
  const realEmailAlias = window.__fakeFormFillerEmail || null;

  function valueFor(type) {
    switch (type) {
      case "email": return realEmailAlias;
      case "firstName": return session.firstName;
      case "lastName": return session.lastName;
      case "fullName": return session.fullName;
      case "address": return session.address;
      case "city": return session.city;
      case "zip": return session.zip;
      case "state": return session.state;
      case "phone": return session.phone;
      case "company": return session.company;
      case "birthdate": return session.birthdate;
      default: return null;
    }
  }

  // Native setter, necessary for frameworks like React to "see" the change.
  function setNativeValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fillSelect(el, type) {
    const target = normalize(valueFor(type) || "");
    const options = Array.from(el.options).filter((o) => o.value && !o.disabled);
    if (options.length === 0) return false;

    let match = options.find((o) => normalize(o.textContent).includes(target) || normalize(o.value).includes(target));
    if (!match) match = options[Math.floor(Math.random() * options.length)];

    el.value = match.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function fillRandomSelect(el) {
    if (el.disabled || el.multiple) return false;

    const options = Array.from(el.options).filter((o) => o.value && !o.disabled);
    if (options.length === 0) return false;

    const choice = pick(options);
    if (el.value === choice.value) return false;

    el.value = choice.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // ---------- Radio buttons / checkboxes ----------
  function fillRadiosAndCheckboxes() {
    let count = 0;

    // Radio: only one element active per group
    const radios = Array.from(document.querySelectorAll('input[type="radio"]'))
      .filter((r) => !r.disabled && !r.readOnly);

    const groups = {};
    radios.forEach((r) => {
      const key = r.name || r.closest("fieldset") || r; // fallback if "name" is missing
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.values(groups).forEach((group) => {
      const choice = group[Math.floor(Math.random() * group.length)];
      if (!choice.checked) {
        choice.click(); // Real click(): updates checked state + triggers events (also compatible with React)
      }
      count++;
    });

    // Checkbox: each checked independently
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .filter((c) => !c.disabled && !c.readOnly);

    checkboxes.forEach((c) => {
      if (!c.checked && Math.random() < 0.5) {
        c.click();
        count++;
      }
    });

    return count;
  }

  // ---------- Execution ----------
  function fillForm() {
    const fields = document.querySelectorAll("input, textarea, select");
    let count = 0;

    fields.forEach((el) => {
      const type = classify(el);

      if (el.tagName === "SELECT") {
        if (type) {
          if (fillSelect(el, type)) count++;
        } else if (fillRandomSelect(el)) {
          count++;
        }
        return;
      }

      if (!type) return;

      const value = valueFor(type);
      if (value == null) return;

      setNativeValue(el, value);
      count++;
    });

    count += fillRadiosAndCheckboxes();

    return count;
  }

  return fillForm();
})();