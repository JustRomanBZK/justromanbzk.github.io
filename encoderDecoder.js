// Функции для кодирования в base64 и декодирования из base64
function b64encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
}

function b64decode(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

class EncoderDecoder {
    constructor() {
        this.key = 'FZ\x99MÛSê/\x96·V«xÞh\x90í¢³4<`ô2\x98ª,µ¦Y\x9Bû';
    }

    // Алгоритм шифрования RC4
    rc4(data) {
        let s = [];
        let j = 0;
        let result = '';
        for (let i = 0; i < 256; i++) {
            s[i] = i;
        }

        for (let i = 0; i < 256; i++) {
            j = (j + s[i] + this.key.charCodeAt(i % this.key.length)) % 256;
            [s[i], s[j]] = [s[j], s[i]];
        }

        let i = 0;
        j = 0;
        for (let char of data) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            [s[i], s[j]] = [s[j], s[i]];
            result += String.fromCharCode(char.charCodeAt(0) ^ s[(s[i] + s[j]) % 256]);
        }

        return result;
    }

    encode(input) {
        try {
            JSON.parse(input);
        } catch (error) {
            throw new Error('Input to encode must be a valid JSON string');
        }
        if (input.length > 50000) {
            throw new Error('Input to encode must be less than or equal to 50000 characters');
        }

        const rc4Encrypted = this.rc4(input);
        return b64encode(rc4Encrypted);
    }

    decode(input) {
        if (input.length > 50000) {
            throw new Error('Input to decode must be less than or equal to 50000 characters');
        }

        const rc4Decrypted = this.rc4(b64decode(input));
        try {
            return JSON.parse(rc4Decrypted);
        } catch (error) {
            throw new Error('Failed to decode input. Make sure it is correctly encoded.');
        }
    }
}

// Используйте этот обновленный класс EncoderDecoder в вашем коде как и раньше.
