# Bun-Vosk

This repository provides Vosk's capabilities directly within a Bun application.

## Installation

To use this library, first ensure you have Bun installed. Then, add the necessary dependencies:

```sh
bun add bun-vosk
```

## Usage

### Setting Log Level

You can set the log level for Vosk using the `setLogLevel` function:

```typescript
import { setLogLevel } from 'bun-vosk'

setLogLevel(0) // 0: INFO, 1: WARNING, 2: DEBUG, 3: TRACE
```

### Model Handling

Create and manage a Vosk model using the `Model` class:

```typescript
import { Model } from 'bun-vosk'

const model = new Model('/path/to/your/model')
model.free() // Free the model when done
```

### Speaker Model Handling

Similarly, manage a speaker model with the `SpeakerModel` class:

```typescript
import { SpeakerModel } from 'bun-vosk'

const speakerModel = new SpeakerModel('/path/to/your/speaker-model')
speakerModel.free() // Free the speaker model when done
```

### Recognizer Usage

The `Recognizer` class provides an interface to Vosk's recognition functionalities. It can be configured for basic recognition, grammar-based recognition, or speaker recognition:

```typescript
import { Model, Recognizer } from 'bun-vosk'

const model = new Model('/path/to/your/model')
const recognizer = new Recognizer({ model, sampleRate: 16000 })

// To recognize audio data
const result = recognizer.acceptWaveform(Buffer.from(audioData))

if (result) {
  console.log(recognizer.result())
}

recognizer.free()
model.free()
```

## API

### `setLogLevel(level: number)`

Sets the log level for Vosk.

- `level`: Log level (0: INFO, 1: WARNING, 2: DEBUG, 3: TRACE)

### `Model`

Class for handling Vosk models.

- `constructor(modelPath: string)`: Creates a new model instance.
- `free()`: Frees the model resources.

### `SpeakerModel`

Class for handling Vosk speaker models.

- `constructor(modelPath: string)`: Creates a new speaker model instance.
- `free()`: Frees the speaker model resources.

### `Recognizer`

Class for handling Vosk recognition tasks.

- `constructor(param: BaseRecognizerParam & T)`: Creates a new recognizer instance.
- `setWords(words: boolean)`: Sets whether to include words in recognition results.
- `setMaxAlternatives(max_alternatives: number)`: Sets the maximum number of alternative results.
- `setPartialWords(partial_words: boolean)`: Sets whether to include partial words in recognition results.
- `setSpkModel(spk_model: Model)`: Sets the speaker model for recognition.
- `acceptWaveform(data: Buffer)`: Accepts audio data for recognition.
- `result()`: Gets the recognition result.
- `partialResult()`: Gets the partial recognition result.
- `finalResult()`: Gets the final recognition result.
- `reset()`: Resets the recognizer.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
