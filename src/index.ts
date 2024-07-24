import { FFIType, dlopen, suffix } from 'bun:ffi'
import type { Pointer } from 'bun:ffi'
import { convertStringToPtr } from './utils'

interface RecognitionResults {
  result: {
    conf: number
    start: number
    end: number
    word: string
  }[]
  text: string
}

interface SpeakerResults {
  spk: number[]
  spk_frames: number
}

interface BaseRecognizerParam {
  model: Model
  sampleRate: number
}

interface GrammarRecognizerParam {
  grammar: string[]
}

interface SpeakerRecognizerParam {
  speakerModel: SpeakerModel
}

type Result<T> = T extends SpeakerRecognizerParam
  ? SpeakerResults & RecognitionResults
  : RecognitionResults

interface PartialResults {
  partial: string
}

const libPath = `${import.meta.dir}/lib/libvosk.${suffix}`

const {
  symbols: {
    vosk_set_log_level,
    vosk_model_new,
    vosk_model_free,
    vosk_spk_model_new,
    vosk_spk_model_free,
    vosk_recognizer_new,
    vosk_recognizer_new_spk,
    vosk_recognizer_new_grm,
    vosk_recognizer_free,
    vosk_recognizer_set_max_alternatives,
    vosk_recognizer_set_words,
    vosk_recognizer_set_partial_words,
    vosk_recognizer_set_spk_model,
    vosk_recognizer_accept_waveform,
    vosk_recognizer_result,
    vosk_recognizer_final_result,
    vosk_recognizer_partial_result,
    vosk_recognizer_reset,
  },
} = dlopen(libPath, {
  vosk_set_log_level: {
    args: [FFIType.i32],
    returns: FFIType.void,
  },
  vosk_model_new: {
    args: [FFIType.cstring],
    returns: FFIType.ptr,
  },
  vosk_model_free: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vosk_spk_model_new: {
    args: [FFIType.cstring],
    returns: FFIType.ptr,
  },
  vosk_spk_model_free: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vosk_recognizer_new: {
    args: [FFIType.ptr, FFIType.f32],
    returns: FFIType.ptr,
  },
  vosk_recognizer_new_spk: {
    args: [FFIType.ptr, FFIType.f32, FFIType.ptr],
    returns: FFIType.ptr,
  },
  vosk_recognizer_new_grm: {
    args: [FFIType.ptr, FFIType.f32, FFIType.cstring],
    returns: FFIType.ptr,
  },
  vosk_recognizer_free: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vosk_recognizer_set_max_alternatives: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  vosk_recognizer_set_words: {
    args: [FFIType.ptr, FFIType.bool],
    returns: FFIType.void,
  },
  vosk_recognizer_set_partial_words: {
    args: [FFIType.ptr, FFIType.bool],
    returns: FFIType.void,
  },
  vosk_recognizer_set_spk_model: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  vosk_recognizer_accept_waveform: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
    returns: FFIType.i32,
  },
  vosk_recognizer_result: {
    args: [FFIType.ptr],
    returns: FFIType.cstring,
  },
  vosk_recognizer_final_result: {
    args: [FFIType.ptr],
    returns: FFIType.cstring,
  },
  vosk_recognizer_partial_result: {
    args: [FFIType.ptr],
    returns: FFIType.cstring,
  },
  vosk_recognizer_reset: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
})

export function setLogLevel(level: number) {
  vosk_set_log_level(level)
}

export class Model {
  handle: Pointer | null = null
  constructor(modelPath: string) {
    this.handle = vosk_model_new(convertStringToPtr(modelPath))
  }

  free() {
    vosk_model_free(this.handle)
  }
}

export class SpeakerModel {
  handle: Pointer | null = null

  constructor(modelPath: string) {
    this.handle = vosk_spk_model_new(convertStringToPtr(modelPath))
  }

  free() {
    vosk_spk_model_free(this.handle)
  }
}

export class Recognizer<
  T extends Partial<SpeakerRecognizerParam | GrammarRecognizerParam> = object,
> {
  handle: Pointer | null = null
  constructor(param: BaseRecognizerParam & T) {
    const { model, sampleRate } = param
    if ('speakerModel' in param && 'grammar' in param) {
      throw new Error(
        'grammar and speakerModel cannot be used together for now.',
      )
    }

    if ('grammar' in param && param.grammar) {
      this.handle = vosk_recognizer_new_grm(
        model.handle,
        sampleRate,
        convertStringToPtr(JSON.stringify(param.grammar)),
      )
    }
    else if ('speakerModel' in param && param.speakerModel) {
      this.handle = vosk_recognizer_new_spk(
        model.handle,
        sampleRate,
        param.speakerModel!.handle,
      )
    }
    else {
      this.handle = vosk_recognizer_new(model.handle, sampleRate)
    }
  }

  free() {
    vosk_recognizer_free(this.handle)
  }

  setWords(words: boolean) {
    vosk_recognizer_set_words(this.handle, words)
  }

  setMaxAlternatives(max_alternatives: number) {
    vosk_recognizer_set_max_alternatives(this.handle, max_alternatives)
  }

  setPartialWords(partial_words: boolean) {
    vosk_recognizer_set_partial_words(this.handle, partial_words)
  }

  setSpkModel(spk_model: Model) {
    vosk_recognizer_set_spk_model(this.handle, spk_model.handle)
  }

  acceptWaveform(data: Buffer | Uint8Array) {
    return vosk_recognizer_accept_waveform(this.handle, data, data.length)
  }

  result(): Result<T> {
    return JSON.parse(vosk_recognizer_result(this.handle).toString())
  }

  partialResult(): PartialResults {
    return JSON.parse(vosk_recognizer_partial_result(this.handle).toString())
  }

  finalResult() {
    return JSON.parse(vosk_recognizer_final_result(this.handle).toString())
  }

  reset() {
    vosk_recognizer_reset(this.handle)
  }
}
