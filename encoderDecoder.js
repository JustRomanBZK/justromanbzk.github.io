/**
 * Encryption key used for encoding and decoding operations.
 * @type {string}
 */
const ENCRYPTION_KEY = "\x030é\b7°\x94\x0E-³x\x9DûËfîâÀ\x0EZâ©\x04\x9CSÑä`\x88\x9CÁ'"

class EncoderDecoder {

  /**
   * Encodes a JSON string using XOR encryption.
   * 
   * @param {string} input - The JSON string to encode.
   * @returns {string} - The encoded string.
   * @throws {Error} - If the input is not a valid JSON string or exceeds 50000 characters.
   */
  encode(input) {
    try {
      JSON.parse(input);
    } catch (error) {
      throw new Error('Input to encode must be a valid JSON string');
    }
    if (input.length > 50000) {
      throw new Error('Input to encode must be less than or equal to 50000 characters');
    }

    let stringifiedJson = unescape(encodeURIComponent(input));
    let xal = Array.from(stringifiedJson).map((char, i) => {
      let encodedCharcode = char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      return '0'.concat((255 & encodedCharcode).toString(16)).slice(-2);
    }).join('');
    return xal;
  }

  /**
   * Decodes a string using a custom encryption algorithm.
   * 
   * @param {string} input - The string to be decoded.
   * @returns {object} - The decoded object.
   * @throws {Error} - If the input is not a string, contains non-alphanumeric characters,
   *                   has an odd number of characters, or exceeds the maximum length of 50000 characters.
   */
  decode(input) {
    if (typeof input !== 'string') {
      throw new Error('Input to decode must be a string');
    }

    if (!/^[a-zA-Z0-9]+$/.test(input)) {
      throw new Error('Input to decode must be alphanumeric');
    }

    if (input.length % 2 !== 0) {
      throw new Error('Input to decode must have an even number of characters');
    }

    if (input.length > 50000) {
      throw new Error('Input to decode must be less than or equal to 50000 characters');
    }

    let stringifiedJson = Array.from(input.match(/.{1,2}/g)).map((hexByte, i) => {
      let encodedCharcode = parseInt(hexByte, 16);
      let originalCharcode = encodedCharcode ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      return String.fromCharCode(originalCharcode);
    }).join('');

    let decodedXal;
    try {
      decodedXal = JSON.parse(decodeURIComponent(escape(stringifiedJson)));
    } catch (error) {
      throw error;
    }
    return decodedXal;
  }
}

document.addEventListener('DOMContentLoaded', (event) => {

  window.onload = function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const button = document.getElementById('decryptButton');
    const switchState = document.getElementById('switchState');

    if (toggleSwitch.checked) {
      button.textContent = 'Decode';
      switchState.textContent = 'DECODE';
    } else {
      button.textContent = 'Encode';
      switchState.textContent = 'ENCODE';
    }
  };

  document.getElementById('toggleSwitch').addEventListener('change', function() {
    const button = document.getElementById('decryptButton');
    const switchState = document.getElementById('switchState');
    if (this.checked) {
      button.textContent = 'Decode';
      switchState.textContent = 'DECODE';
    } else {
      button.textContent = 'Encode';
      switchState.textContent = 'ENCODE';
    }
  });

  document.getElementById('decryptButton').addEventListener('click', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const encodedString = document.getElementById('encodedString');
    const error = document.getElementById('error');
    const encoderDecoder = new EncoderDecoder();
    let result;

    if (toggleSwitch.checked) {
      if (!/^[a-fA-F0-9]+$/.test(encodedString.value.trim())) {
        displayError(encodedString, error, '* Invalid XAL token. Please check your input and try again.');
        return;
      }
    } else {
      try {
        JSON.parse(encodedString.value);
      } catch (e) {
        displayError(encodedString, error, '* Invalid JSON string. Please check your input and try again.');
        return;
      }
    }

    try {
      if (toggleSwitch.checked) {
        result = encoderDecoder.decode(encodedString.value);
      } else {
        let json = JSON.parse(encodedString.value);
        result = encoderDecoder.encode(JSON.stringify(json));
      }

      encodedString.value = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
      encodedString.classList.remove('error');
      error.style.display = 'none';
    } catch (error) {
      displayError(encodedString, error, '* An error occurred during encoding/decoding. Please check your input and try again.');
    }
  });

  /**
   * Displays an error message and applies error styling to the encoded string element.
   * @param {HTMLElement} encodedString - The element representing the encoded string.
   * @param {HTMLElement} error - The element where the error message will be displayed.
   * @param {string} message - The error message to be displayed.
   */
  function displayError(encodedString, error, message) {
    encodedString.classList.remove('error');
    void encodedString.offsetWidth;
    encodedString.classList.add('error');
    error.textContent = message;
    error.style.display = 'block';
  }
});
