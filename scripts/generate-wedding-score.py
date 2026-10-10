"""Create an original, quiet instrumental loop for the wedding invitation.

Uses only Python's standard library. The melody and harmony below were written
for this project; the supplied commercial song is intentionally not used.
"""

from array import array
from math import cos, pi, sin
from pathlib import Path
import wave

RATE = 22050
DURATION = 32
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "music" / "wedding-story-original.wav"
samples = [0.0] * (RATE * DURATION)


def frequency(midi_note):
    return 440 * 2 ** ((midi_note - 69) / 12)


def add_note(start, length, midi_note, volume, bell=False):
    first = int(start * RATE)
    count = min(int(length * RATE), len(samples) - first)
    if count <= 0:
        return
    omega = 2 * pi * frequency(midi_note)
    for offset in range(count):
        t = offset / RATE
        if bell:
            envelope = min(1, t / 0.025) * (1 - t / length) ** 1.6
            tone = sin(omega * t) + 0.24 * sin(2 * omega * t) + 0.07 * sin(3 * omega * t)
        else:
            envelope = min(1, t / 0.8) * min(1, (length - t) / 1.2)
            tone = sin(omega * t) + 0.12 * sin(2 * omega * t)
        samples[first + offset] += volume * envelope * tone


# Eight slow bars: Cmaj7, Am7, Fmaj7, G6, then a varied return.
chords = [
    (48, 55, 59, 64), (45, 52, 55, 60), (41, 48, 52, 57), (43, 50, 55, 59),
    (48, 55, 59, 64), (45, 52, 57, 60), (41, 48, 52, 57), (43, 50, 55, 62),
]
melodies = [
    (72, 76, 79, 76), (72, 69, 72, 76), (69, 72, 76, 72), (71, 74, 79, 74),
    (72, 79, 76, 72), (69, 72, 76, 81), (77, 76, 72, 69), (71, 74, 79, 72),
]
for bar, (chord, melody) in enumerate(zip(chords, melodies)):
    start = bar * 4
    for note in chord:
        add_note(start, 3.95, note, 0.028)
    for beat, note in enumerate(melody):
        add_note(start + beat, 0.85, note, 0.085, bell=True)

pcm = array("h")
for index, value in enumerate(samples):
    seconds = index / RATE
    fade = min(1, seconds / 0.7, (DURATION - seconds) / 1.1)
    pcm.append(int(max(-1, min(1, value * max(0, fade))) * 32767))

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUTPUT), "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(RATE)
    output.writeframes(pcm.tobytes())

print(f"Created {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
