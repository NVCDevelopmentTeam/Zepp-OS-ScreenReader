import espeak from 'espeak-ng';
class EspeakTTSNG {
    constructor() {
        this.voice = 'default'; // Default voice
        this.pitch = 50; // High
        this.rate = 175; // Reading speed
    }

    // Set up reading voice
    setVoice(voice) {
        this.voice = voice;
    }

    // Set the pitch
    setPitch(pitch) {
        this.pitch = pitch;
    }

    // Set reading speed
    setRate(rate) {
        this.rate = rate;
    }

    // Convert text to speech
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!text) {
                reject(new Error('No text provided'));
                return;
            }

            const command = `espeak -v ${this.voice} -p ${this.pitch} -s ${this.rate} "${text}"`;
            const exec = require('child_process').exec;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Stderr: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    }
}

module.exports = EspeakTTSNG;