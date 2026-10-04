const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const source = fs.readFileSync(process.env.SOURCE_HTML || path.join(__dirname, '..', 'index.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

async function fixture() {
    const elements = new Map();
    const frames = [];
    const streams = [];
    const controls = { deny: false, constructorError: false };
    function element(id) {
        if (!elements.has(id)) elements.set(id, {
            value: id === 'apiKey' ? 'fixture-key' : '', style: {}, listeners: {},
            addEventListener(type, callback) { this.listeners[type] = callback; },
            appendChild() {}, parentElement: { insertBefore() {} },
            classList: { add() {}, remove() {} },
            getContext() { return { drawImage() {} }; },
            toDataURL() { return 'data:image/jpeg;base64,AA=='; }
        });
        return elements.get(id);
    }
    function makeStream() {
        const tracks = ['audio', 'video'].map(kind => ({ kind, readyState: 'live', stops: 0,
            stop() { this.stops++; this.readyState = 'ended'; } }));
        const stream = { getTracks: () => tracks, getVideoTracks: () => tracks.filter(t => t.kind === 'video') };
        streams.push(stream);
        return stream;
    }
    class AudioContext {
        constructor() { if (controls.constructorError) throw Error('audio constructor'); this.destination = {}; this.currentTime = 0; }
        createGain() { return { connect() {}, disconnect() {}, gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} } }; }
        createBuffer(n, length, rate) { return { duration: length / rate, getChannelData: () => new Float32Array(length) }; }
        createBufferSource() { return { connect() {}, start() {}, stop() {} }; }
        close() {}
    }
    const context = {
        console: { log() {}, error() {}, warn() {} },
        document: { getElementById: element, querySelector: element, createElement: element },
        localStorage: { getItem: () => 'fixture-key', setItem() {} },
        window: { addEventListener() {} },
        navigator: { mediaDevices: {
            async getUserMedia() { if (controls.deny) throw Error('permission denied'); return makeStream(); },
            enumerateDevices: async () => [], addEventListener() {}
        } },
        AudioContext, MediaStream: function(tracks) { return { getTracks: () => tracks }; },
        startButton: element('startButton'), setTimeout() {},
        requestAnimationFrame(callback) { frames.push(callback); },
        Blob, Float32Array, Int16Array, Uint8Array, DataView, Date, atob, btoa
    };
    vm.createContext(context);
    vm.runInContext(source + '\nglobalThis.readState = () => ({ publisher, stream }); globalThis.Publisher = GoogleLivePublisher;', context);
    await new Promise(setImmediate);
    streams.length = 0;
    context.Publisher.prototype.connect = async function() {};
    context.Publisher.prototype.setupAudioProcessing = async function() {};
    const actualVideoSetup = context.Publisher.prototype.setupVideoProcessing;
    context.Publisher.prototype.setupVideoProcessing = function() {};
    return { context, controls, streams, frames, element, actualVideoSetup,
        click: () => element('startButton').listeners.click(),
        state: () => context.readState(),
        async change(id) { await element(id).listeners.change.call(element(id)); await new Promise(setImmediate); }
    };
}
function ended(stream) { assert.ok(stream.getTracks().every(t => t.readyState === 'ended')); }
function live(stream) { assert.ok(stream.getTracks().every(t => t.readyState === 'live')); }
function idle(f) { assert.equal(f.state().publisher, null); assert.equal(f.element('preview').srcObject, null); assert.equal(f.element('startButton').textContent, 'Start Stream'); }

test('start acquires a live camera and microphone', async () => { const f = await fixture(); await f.click(); live(f.streams[0]); assert.equal(f.element('startButton').textContent, 'Stop Stream'); });
test('Stop Stream releases tracks and clears ownership and preview', async () => { const f = await fixture(); await f.click(); await f.click(); ended(f.streams[0]); idle(f); assert.equal(f.state().stream, null); });
test('repeated publisher stop releases tracks and resources only once', async () => { const f = await fixture(); await f.click(); const p = f.state().publisher; let closes = 0; p.ws = { close() { closes++; } }; p.stop(); p.stop(); ended(f.streams[0]); assert.equal(closes, 1); assert.ok(f.streams[0].getTracks().every(t => t.stops === 1)); });
test('stop then restart gets fresh live tracks', async () => { const f = await fixture(); await f.click(); await f.click(); await f.click(); ended(f.streams[0]); live(f.streams[1]); assert.equal(f.state().publisher.stream, f.streams[1]); });
for (const stage of ['connect', 'setupAudioProcessing', 'setupVideoProcessing']) test(`${stage} failure releases tracks and the next click retries`, async () => {
    const f = await fixture(); const original = f.context.Publisher.prototype[stage];
    f.context.Publisher.prototype[stage] = async function() { throw Error('failure'); };
    // Video setup is synchronous in the app.
    if (stage === 'setupVideoProcessing') f.context.Publisher.prototype[stage] = function() { throw Error('failure'); };
    await f.click(); ended(f.streams[0]); idle(f); assert.ok(f.streams[0].getTracks().every(t => t.stops === 1));
    f.context.Publisher.prototype[stage] = original; await f.click(); live(f.streams[1]); assert.equal(f.element('startButton').textContent, 'Stop Stream');
});
test('AudioContext constructor failure releases acquired tracks', async () => { const f = await fixture(); f.controls.constructorError = true; await f.click(); ended(f.streams[0]); idle(f); f.controls.constructorError = false; await f.click(); live(f.streams[1]); });
test('permission denial acquires no streams and permits retry', async () => { const f = await fixture(); f.controls.deny = true; await f.click(); assert.equal(f.streams.length, 0); assert.equal(f.state().publisher, null); f.controls.deny = false; await f.click(); live(f.streams[0]); });
for (const id of ['voiceSelect', 'responseType']) {
    test(`${id} restart releases old stream and starts a fresh one`, async () => { const f = await fixture(); await f.click(); await f.change(id); ended(f.streams[0]); live(f.streams[1]); assert.equal(f.state().publisher.stream, f.streams[1]); });
    test(`${id} failed restart releases replacement tracks and permits retry`, async () => { const f = await fixture(); await f.click(); f.context.Publisher.prototype.connect = async function() { throw Error('connection'); }; await f.change(id); ended(f.streams[0]); ended(f.streams[1]); idle(f); f.context.Publisher.prototype.connect = async function() {}; await f.click(); live(f.streams[2]); });
}
test('queued video frame after stop exits before reading cleared canvas', async () => { const f = await fixture(); f.context.Publisher.prototype.setupVideoProcessing = f.actualVideoSetup; await f.click(); f.element('video').listeners.loadedmetadata(); assert.equal(f.frames.length, 1); await f.click(); assert.doesNotThrow(() => f.frames.shift()()); assert.equal(f.frames.length, 0); });
test('stale teardown does not clear replacement owner or preview', async () => { const f = await fixture(); await f.click(); const old = f.state().publisher; await f.click(); await f.click(); const current = f.state().publisher; if (f.context.stopPublisher) f.context.stopPublisher(old); else old.stop(); assert.equal(f.state().publisher, current); assert.equal(f.element('preview').srcObject, current.stream); live(current.stream); });
