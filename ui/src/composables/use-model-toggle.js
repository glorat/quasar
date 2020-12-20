import { watch, nextTick, onMounted } from 'vue'

export const useModelToggleProps = {
  modelValue: {
    type: Boolean,
    default: null
  }
}

export const useModelToggleEmits = [
  'update:modelValue', 'before-show', 'show', 'before-hide', 'hide'
]

// handleShow/handleHide -> removeTick(), self (& emit show), prepareTick()

export default function ({
  props,
  emit,
  showing,
  emitListeners,
  canShow, // optional
  vm, // optional (required by hideOnRouteChange)
  hideOnRouteChange, // optional
  handleShow, // optional
  handleHide, // optional
  processOnMount // optional
}) {
  let payload

  function toggle (evt) {
    if (showing.value === true) {
      hide(evt)
    }
    else {
      show(evt)
    }
  }

  function show (evt) {
    if (props.disable === true || (canShow !== void 0 && canShow(evt) !== true)) {
      return
    }

    const listener = emitListeners.value[ 'onUpdate:modelValue' ] === true

    if (listener === true && __QUASAR_SSR_SERVER__ !== true) {
      emit('update:modelValue', true)
      payload = evt
      nextTick(() => {
        if (payload === evt) {
          payload = void 0
        }
      })
    }

    if (props.modelValue === null || listener === false || __QUASAR_SSR_SERVER__) {
      processShow(evt)
    }
  }

  function processShow (evt) {
    if (showing.value === true) {
      return
    }

    showing.value = true

    emit('before-show', evt)

    if (handleShow !== void 0) {
      handleShow(evt)
    }
    else {
      emit('show', evt)
    }
  }

  function hide (evt) {
    if (__QUASAR_SSR_SERVER__ || props.disable === true) {
      return
    }

    const listener = emitListeners.value[ 'onUpdate:modelValue' ] === true

    if (listener === true && __QUASAR_SSR_SERVER__ !== true) {
      emit('update:modelValue', false)
      payload = evt
      nextTick(() => {
        if (payload === evt) {
          payload = void 0
        }
      })
    }

    if (props.modelValue === null || listener === false || __QUASAR_SSR_SERVER__) {
      processHide(evt)
    }
  }

  function processHide (evt) {
    if (showing.value === false) {
      return
    }

    showing.value = false

    emit('before-hide', evt)

    if (handleHide !== void 0) {
      handleHide(evt)
    }
    else {
      emit('hide', evt)
    }
  }

  function processModelChange (val) {
    if (props.disable === true && val === true) {
      if (emitListeners.value[ 'onUpdate:modelValue' ] === true) {
        emit('update:modelValue', false)
      }
    }
    else if ((val === true) !== showing.value) {
      const fn = val === true ? processShow : processHide
      fn(payload)
    }
  }

  watch(() => props.modelValue, processModelChange)

  if (hideOnRouteChange !== void 0 && vm !== void 0 && vm.proxy.$route !== void 0) {
    watch(() => vm.proxy.$route, () => {
      if (hideOnRouteChange.value === true && showing.value === true) {
        hide()
      }
    })
  }

  processOnMount === true && onMounted(() => {
    processModelChange(props.modelValue)
  })

  return {
    show,
    hide,
    toggle
  }
}
