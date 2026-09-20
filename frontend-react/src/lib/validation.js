/* KisanSetu — Form Validation runner.
   Field rules (with translated messages) come from the `validators()`
   hook in lib/i18n.jsx; this module only runs a values object against
   a { field: [rule, ...] } map so pages share one code path. */

/** Validate a values object against { field: [validators] }. Returns { field: message }. */
export function validateValues(values, rules) {
  const errors = {};
  for (const [fieldId, validators] of Object.entries(rules)) {
    const value = values[fieldId] ?? "";
    for (const validator of validators) {
      const result = validator(value, values);
      if (result !== true) {
        errors[fieldId] = result;
        break;
      }
    }
  }
  return errors;
}
