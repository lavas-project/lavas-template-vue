"use strict";

function convertStringToAsset(assetAsString) {
  return {
    source: function source() {
      return assetAsString;
    },
    size: function size() {
      return assetAsString.length;
    }
  };
}

module.exports = convertStringToAsset;