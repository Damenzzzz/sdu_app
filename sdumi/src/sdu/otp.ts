// Parse the my.sdu.edu.kz 2FA (one-time code) page into a submittable challenge.
// The exact field/action names aren't known ahead of time, so we discover them
// from the page: find the form whose visible input is the code field, and carry
// over every other (hidden) field unchanged.

const BASE = "https://my.sdu.edu.kz/";

export interface OtpChallenge {
  studentId: string;
  action: string; // absolute URL to POST the code to
  fields: [string, string][]; // hidden/other fields to carry over
  codeField: string; // name of the input the code goes into
}

export function parseOtpForm(html: string, studentId: string): OtpChallenge | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const forms = Array.from(doc.querySelectorAll("form"));

  for (const form of forms) {
    const inputs = Array.from(form.querySelectorAll("input"));

    const codeInput = inputs.find((i) => {
      const type = (i.getAttribute("type") || "text").toLowerCase();
      if (!["text", "number", "tel", "password"].includes(type)) return false;
      const name = (i.getAttribute("name") || "").toLowerCase();
      const meta = (
        name +
        " " +
        (i.getAttribute("id") || "") +
        " " +
        (i.getAttribute("placeholder") || "")
      ).toLowerCase();
      const looksCode =
        /code|otp|pin|token|verif|sms|digit|код/.test(meta) ||
        i.getAttribute("maxlength") === "6";
      // On the OTP page there's no username/password, so any lone text field
      // is the code; the looksCode check just prioritises the obvious one.
      return looksCode || (name !== "username" && name !== "password");
    });

    if (!codeInput) continue;
    const codeField = codeInput.getAttribute("name") || "";
    if (!codeField) continue;

    const action = new URL(form.getAttribute("action") || BASE, BASE).href;
    const fields: [string, string][] = [];
    for (const i of inputs) {
      const name = i.getAttribute("name");
      if (!name || name === codeField) continue;
      fields.push([name, i.getAttribute("value") || ""]);
    }
    return { studentId, action, fields, codeField };
  }

  return null;
}
