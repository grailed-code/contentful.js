var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import memoize from 'lodash/memoize';

/**
 * Sets getters on links for a given response
 * @private
 * @param {Array<Entry|Asset|DeletedEntry|DeletedAsset>} items
 * @param {Object} includes - Object with lists of Entry, Asset, DeletedEntry and DeletedAsset
 */
export default function mixinLinkGetters(items, includes) {
  var linkGetter = memoize(getLinksFromIncludes, memoizationResolver);
  items.forEach(function (item) {
    if (item.fields) {
      setLocalizedFieldGetters(item.fields, !!item.sys.locale);
    }
  });

  /**
   * If a field does not have a locale defined in sys, the content of that field
   * is an object where the keys are each available locale, and we need to iterate
   * over each of those
   * @private
   * @param {Object} fields - Fields object
   * @param {boolean} hasLocale - If entry has been requested with a locale
   */
  function setLocalizedFieldGetters(fields, hasLocale) {
    if (hasLocale) {
      setFieldGettersForFields(fields);
    } else {
      var fieldKeys = Object.keys(fields);
      fieldKeys.forEach(function (fieldKey) {
        return setFieldGettersForFields(fields[fieldKey]);
      });
    }
  }

  /**
   * Sets getters on each link field or list of link fields for each item
   * @private
   * @param {Object} fields - Fields object
   */
  function setFieldGettersForFields(fields) {
    var fieldKeys = Object.keys(fields);
    fieldKeys.forEach(function (fieldKey) {
      var field = fields[fieldKey];
      if (Array.isArray(field)) {
        addGetterForLinkArray(field, fieldKey, fields);
      } else {
        addGetterForLink(field, fieldKey, fields);
      }
    });
  }

  /**
   * Sets a getter which resolves the link of the given fieldKey in fields
   * @private
   * @param {Object} field - Field object
   * @param {string} fieldKey
   * @param {Object} fields - Fields object
   */
  function addGetterForLink(field, fieldKey, fields) {
    if (field !== null && (typeof field === 'undefined' ? 'undefined' : _typeof(field)) === 'object' && field.hasOwnProperty('sys') && field.sys.hasOwnProperty('type') && field.sys.type === 'Link') {
      Object.defineProperty(fields, fieldKey, {
        get: function get() {
          return linkGetter(field);
        }
      });
    }
  }

  /**
   * Sets a getter which resolves the array of links of the given fieldKey in fields
   * @private
   * @param {Array<Object>} field - List field array
   * @param {string} fieldKey
   * @param {Object} fields - Fields object
   */
  function addGetterForLinkArray(listField, fieldKey, fields) {
    if (listField.length && listField[0] !== null && _typeof(listField[0]) === 'object' && listField[0].hasOwnProperty('sys') && listField[0].sys.hasOwnProperty('type') && listField[0].sys.type === 'Link') {
      Object.defineProperty(fields, fieldKey, {
        get: function get() {
          return listField.map(function (field) {
            return linkGetter(field);
          });
        }
      });
    }
  }

  /**
   * Looks for given link field in includes.
   * If linked entity is not found, it returns the original link.
   * This method shouldn't be used directly, and it's memoized whenever this
   * module's main method is used.
   * This is done to prevent the same link being resolved multiple times.
   * @private
   * @param {Object} field - Field object
   * @return {Object} Field, or link if field not resolved
   */
  function getLinksFromIncludes(field) {
    var linkedEntities = includes[field.sys.linkType] || [];
    var link = linkedEntities.find(function (linkedEntity) {
      return linkedEntity.sys.id === field.sys.id;
    });
    if (link && link.fields) {
      setLocalizedFieldGetters(link.fields, !!link.sys.locale);
      return link;
    }
    return field;
  }

  function memoizationResolver(link) {
    return link.sys.id;
  }
}