/**
 * Contentful Delivery API Client. Contains methods which allow access to the
 * different kinds of entities present in Contentful (Entries, Assets, etc).
 * @namespace ContentfulClientAPI
 * @see Entities
 */

/**
 * The different kinds of top level entities you can find in Contentful
 * @namespace Entities
 */

/**
 * System metadata. See <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/#/introduction/common-resource-attributes">Common Resource Attributes</a> for more details.
 * @memberof Entities
 * @typedef Sys
 * @prop {string} type
 * @prop {string} id
 * @prop {Entities.Link} space
 * @prop {string} createdAt
 * @prop {string} updatedAt
 * @prop {number} revision
 */

/**
 * Link to another entity. See <a href="https://www.contentful.com/developers/docs/concepts/links/">Links</a> for more details.
 * @memberof Entities
 * @typedef Link
 * @prop {string} type - type of this entity. Always link.
 * @prop {string} id
 * @prop {string} linkType - type of this link. If defined, either Entry or Asset
 */

/**
 * @memberof ContentfulClientAPI
 * @typedef {Object} ClientAPI
 * @prop {function} getSpace
 * @prop {function} getContentType
 * @prop {function} getContentTypes
 * @prop {function} getEntry
 * @prop {function} getEntries
 * @prop {function} getAsset
 * @prop {function} getAssets
 * @prop {function} parseEntries
 * @prop {function} sync
 */

import { createRequestConfig } from 'contentful-sdk-core';
import entities from './entities';
import pagedSync from './paged-sync';

/**
 * Creates API object with methods to access functionality from Contentful's
 * Delivery API
 * @private
 * @param {Object} params - API initialization params
 * @prop {Object} http - HTTP client instance
 * @prop {Object} entities - Object with wrapper methods for each kind of entity
 * @prop {Function} shouldLinksResolve - Link resolver preconfigured with global setting
 * @return {ClientAPI}
 */
export default function createContentfulApi(_ref) {
  var http = _ref.http,
      shouldLinksResolve = _ref.shouldLinksResolve;
  var wrapSpace = entities.space.wrapSpace;
  var _entities$contentType = entities.contentType,
      wrapContentType = _entities$contentType.wrapContentType,
      wrapContentTypeCollection = _entities$contentType.wrapContentTypeCollection;
  var _entities$entry = entities.entry,
      wrapEntry = _entities$entry.wrapEntry,
      wrapEntryCollection = _entities$entry.wrapEntryCollection;
  var _entities$asset = entities.asset,
      wrapAsset = _entities$asset.wrapAsset,
      wrapAssetCollection = _entities$asset.wrapAssetCollection;


  function errorHandler(error) {
    if (error.data) {
      throw error.data;
    }
    throw error;
  }

  /**
   * Gets the Space which the client is currently configured to use
   * @memberof ContentfulClientAPI
   * @return {Promise<Entities.Space>} Promise for a Space
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   * // returns the space object with the above <space-id>
   * client.getSpace()
   * .then((space) => console.log(space))
   * .catch(console.error)
   */
  function getSpace() {
    return http.get('').then(function (response) {
      return wrapSpace(response.data);
    }, errorHandler);
  }

  /**
   * Gets a Content Type
   * @memberof ContentfulClientAPI
   * @param  {string} id
   * @return {Promise<Entities.ContentType>} Promise for a Content Type
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getContentType('<content_type_id>')
   * .then((contentType) => console.log(contentType))
   * .catch(console.error)
   */
  function getContentType(id) {
    return http.get('content_types/' + id).then(function (response) {
      return wrapContentType(response.data);
    }, errorHandler);
  }

  /**
   * Gets a collection of Content Types
   * @memberof ContentfulClientAPI
   * @param  {Object=} query - Object with search parameters. Check the <a href="https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#retrieving-entries-with-search-parameters">JS SDK tutorial</a> and the <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters">REST API reference</a> for more details.
   * @return {Promise<Entities.ContentTypeCollection>} Promise for a collection of Content Types
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getContentTypes()
   * .then((response) => console.log(response.items))
   * .catch(console.error)
   */
  function getContentTypes() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return http.get('content_types', createRequestConfig({ query: query })).then(function (response) {
      return wrapContentTypeCollection(response.data);
    }, errorHandler);
  }

  /**
   * Gets an Entry
   * @memberof ContentfulClientAPI
   * @param  {string} id
   * @param  {Object=} query - Object with search parameters. In this method it's only useful for `locale`.
   * @return {Promise<Entities.Entry>} Promise for an Entry
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getEntry('<entry_id>')
   * .then((entry) => console.log(entry))
   * .catch(console.error)
   */
  function getEntry(id) {
    var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    normalizeSelect(query);
    return http.get('entries/' + id, createRequestConfig({ query: query })).then(function (response) {
      return wrapEntry(response.data);
    }, errorHandler);
  }

  /**
   * Gets a collection of Entries
   * @memberof ContentfulClientAPI
   * @param  {Object=} query - Object with search parameters. Check the <a href="https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#retrieving-entries-with-search-parameters">JS SDK tutorial</a> and the <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters">REST API reference</a> for more details.
   * @return {Promise<Entities.EntryCollection>} Promise for a collection of Entries
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getEntries()
   * .then((response) => console.log(response.items))
   * .catch(console.error)
   */
  function getEntries() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var resolveLinks = shouldLinksResolve(query);
    var resolveForAllLocales = query.locale && query.locale === '*';
    normalizeSelect(query);
    return http.get('entries', createRequestConfig({ query: query })).then(function (response) {
      return wrapEntryCollection(response.data, resolveLinks, resolveForAllLocales);
    }, errorHandler);
  }
  /**
   * Gets an Asset
   * @memberof ContentfulClientAPI
   * @param  {string} id
   * @param  {Object=} query - Object with search parameters. In this method it's only useful for `locale`.
   * @return {Promise<Entities.Asset>} Promise for an Asset
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getAsset('<asset_id>')
   * .then((asset) => console.log(asset))
   * .catch(console.error)
   */
  function getAsset(id) {
    var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    normalizeSelect(query);
    return http.get('assets/' + id, createRequestConfig({ query: query })).then(function (response) {
      return wrapAsset(response.data);
    }, errorHandler);
  }

  /**
   * Gets a collection of Assets
   * @memberof ContentfulClientAPI
   * @param  {Object=} query - Object with search parameters. Check the <a href="https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#retrieving-entries-with-search-parameters">JS SDK tutorial</a> and the <a href="https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters">REST API reference</a> for more details.
   * @return {Promise<Entities.AssetCollection>} Promise for a collection of Assets
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.getAssets()
   * .then((response) => console.log(response.items))
   * .catch(console.error)
   */
  function getAssets() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    normalizeSelect(query);
    return http.get('assets', createRequestConfig({ query: query })).then(function (response) {
      return wrapAssetCollection(response.data);
    }, errorHandler);
  }

  /**
   * Synchronizes either all the content or only new content since last sync
   * See <a href="https://www.contentful.com/developers/docs/concepts/sync/">Synchronization</a> for more information.
   * <strong> Important note: </strong> The the sync api endpoint does not support include or link resolution.
   * However contentful.js is doing link resolution client side if you only make an initial sync.
   * For the delta sync (using nextSyncToken) it is not possible since the sdk wont have access to all the data to make such an operation.
   * @memberof ContentfulClientAPI
   * @param  {Object} query - Query object for the sync call. One of initial or nextSyncToken always needs to be specified, but not both.
   * @param  {boolean?} query.initial - Indicates if this is the first sync. Use it if you don't have a sync token.
   * @param  {string?} query.nextSyncToken - The token you got the last time you used this method. Ensures you only get changed content.
   * @param  {string=} query.type - Filter by this type (all (default), Entry, Asset, Deletion, DeletedAsset or DeletedEntry)
   * @param  {string=} query.content_type - Filter by this content type id
   * @param  {boolean=} query.resolveLinks - When true, links to other Entries or Assets are resolved. Default: true.
   * @return {Promise<Sync.SyncCollection>} Promise for the collection resulting of a sync operation
   * @example
   * const contentful = require('contentful')
   *
   * const client = contentful.createClient({
   *   space: '<space_id>',
   *   accessToken: '<content_delivery_api_key>'
   * })
   *
   * client.sync({
   *   initial: true
   * })
   * .then((response) => console.log({
   *   entries: response.entries,
   *   assets: response.assets,
   *   nextSyncToken: response.nextSyncToken
   * }))
   * .catch(console.error)
   */
  function sync() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var resolveLinks = shouldLinksResolve(query);
    return pagedSync(http, query, resolveLinks);
  }

  /**
  * Parse raw json data into collection of entry objects.Links will be resolved also
  * @memberof ContentfulClientAPI
  * @param {Object} raw json data
  * @example
  * let data = {items: [
  *    {
  *    sys: {type: 'Entry', locale: 'en-US'},
  *    fields: {
  *      animal: {sys: {type: 'Link', linkType: 'Animal', id: 'oink'}},
  *      anotheranimal: {sys: {type: 'Link', linkType: 'Animal', id: 'middle-parrot'}}
  *    }
  *  }
  * ],
  * includes: {
  *  Animal: [
  *    {
  *      sys: {type: 'Animal', id: 'oink', locale: 'en-US'},
  *      fields: {
  *        name: 'Pig',
  *        friend: {sys: {type: 'Link', linkType: 'Animal', id: 'groundhog'}}
  *      }
  *    }
  *   ]
  *  }
  * }
  * console.log( data.items[0].fields.foo ); // undefined
  * let parsedData = client.parseEntries(data);
  * console.log( parsedData.items[0].fields.foo ); // foo
  */
  function parseEntries(data) {
    return wrapEntryCollection(data, true, false);
  }
  /*
   * sdk relies heavily on sys metadata
   * so we cannot omit the sys property on sdk level
   * */
  function normalizeSelect(query) {
    if (query.select && !/sys/i.test(query.select)) {
      query.select += ',sys';
    }
  }

  return {
    getSpace: getSpace,
    getContentType: getContentType,
    getContentTypes: getContentTypes,
    getEntry: getEntry,
    getEntries: getEntries,
    getAsset: getAsset,
    getAssets: getAssets,
    parseEntries: parseEntries,
    sync: sync
  };
}