// frontend/custom-form-next/src/utils/conditionHelper.js

/**
 * Evaluate if a field should be shown based on its logic condition
 * @param {Object} field - Field with logic property
 * @param {Object} answers - Map of fieldId -> answer value
 * @returns {boolean} - Whether field should be shown
 */
export const shouldShowField = (field, answers) => {
  // If no logic, always show
  if (!field.logic?.showWhenFieldId) return true;

  const { showWhenFieldId, operator, value } = field.logic;
  const fieldValue = answers[showWhenFieldId];

  if (fieldValue === undefined) return false;

  const strValue = String(fieldValue).toLowerCase();
  const strCondition = String(value).toLowerCase();

  switch (operator) {
    case 'equals':
      return strValue === strCondition;
    case 'not_equals':
      return strValue !== strCondition;
    case 'contains':
      return strValue.includes(strCondition);
    default:
      return true;
  }
};

/**
 * Get visible fields based on current answers
 * @param {Array} fields - All form fields
 * @param {Object} answers - Map of fieldId -> answer value
 * @returns {Array} - Visible fields
 */
export const getVisibleFields = (fields, answers) => {
  return fields.filter((field) => shouldShowField(field, answers));
};
