<script>
import { CodeJar } from "codejar"
import hljs from "highlight.js/lib/common"
import lang from "assets/js/mathjs.js"
import 'highlight.js/styles/tokyo-night-dark.css'

export default {
  data() {
    return {
      visibleDropdown: false,
      activeMenuItem: undefined,
      filter: '',
      tooltip: undefined,
      tooltipDesc: undefined,
      context: {
        object: false,
        function: false,
        parameterIndex: 0
      },
      jar: null,
    }
  },

  props: [ 'value', 'placeholder' ],

  emits: [ 'update' ],

  computed: {
    namespace() {
      // TODO: Add all mathjs functions (https://mathjs.org/docs/reference/functions.html) and constants (https://mathjs.org/docs/reference/constants.html)
      return {
        // Built-ins
        'false': { type: 'BooleanLiteral' },
        'true': { type: 'BooleanLiteral' },
        'null': { type: 'NullLiteral' },
        'and': { type: 'BooleanBinaryOperator' },
        'not': { type: 'BooleanBinaryOperator' },
        'or': { type: 'BooleanBinaryOperator' },
        'xor': { type: 'BooleanBinaryOperator' },
        'to': { type: 'ConversionOperator' },
        'in': { type: 'ConversionOperator' },
        'mod': { type: 'NumberBinaryOperator' },
        'Infinity': { type: 'StringNumericLiteral' },
        'NaN': { type: 'StringNumericLiteral' },
        'undefined': { type: 'UndefinedKeyword' },
        // Extensions
        'isEmpty': { type: 'Function', signature: 'isEmpty(value: any): boolean', parameters: ['Any value'] },
        'isEqual': { type: 'Function', signature: 'isEqual(valueA: any, valueB: any): boolean', parameters: ['The first value to compare', 'The second value to compare'], description: 'Determines whether the specified values are considered equal.' },
        'startsWith': { type: 'Function', signature: 'startsWith(stringA: string, stringB: string): boolean', parameters: ['The first string to compare', 'The second string to compare'], description: 'Determines whether the beginning of the first string matches the second string.' },
        'endsWith': { type: 'Function', signature: 'endsWith(stringA: string, stringB: string): boolean', parameters: ['The first string to compare', 'The second string to compare'], description: 'Determines whether the end of the first string matches the second string.' },
        'contains': { type: 'Function', signature: 'contains(stringA: string, stringB: string): boolean', parameters: ['The string to search in', 'The string to seek'], description: 'Determines whether a specified substring occurs within a string.' },
        // Transaction data
        'accountNumber': { type: 'StringVariable' },
        'currency': { type: 'StringVariable' },
        'date': { type: 'DateVariable' },
        'amount': { type: 'NumericVariable' },
        'description': { type: 'StringVariable' },
        'accountNumberCounterparty': { type: 'StringVariable' },
        'accountNameCounterparty': { type: 'StringVariable' },
        'structuredCommunication': { type: 'StringVariable' },
        'freeCommunication': { type: 'StringVariable' },
      }
    },
    values() {
      return Object.keys(this.namespace)
    },
    filteredValues() {
      return this.values.filter((v) => v.startsWith(this.filter))
    },
  },

  mounted() {
    hljs.registerLanguage("mathjs", lang)
    this.jar = CodeJar(
      this.$refs.conditionInput,
      hljs.highlightElement, {
        tab: ' '.repeat(4),
        catchTab: false,
        addClosing: false
      }
    )
    this.jar.onUpdate(this.onUpdate)
    this.jar.updateCode(this.value)
  },

  unmounted() {
    this.jar.destroy();
  },

  methods: {
    autocompleteValue(partialValue/*: String*/) {
      const input = this.$refs.conditionInput
      const pos = this.jar.save()
      const value = this.value
      this.value = value.substring(0, /*input.selectionStart*/pos.start) + partialValue + value.substring(/*input.selectionStart*/pos.start)
      input.focus()
    },

    onClick(value) {
      this.autocompleteValue(value.substring(this.filter.length))
      this.visibleDropdown = false
      // Don't remove filter, user will notice this (briefly)
      //this.filter = ''
    },

    autocomplete(filter) {
      this.filter = filter
      this.activeMenuItem = this.filteredValues[0]
      this.visibleDropdown = true
    },

    cancel(cancelInfo = true) {
      this.visibleDropdown = false
      // Don't remove filter, user will notice this (briefly)
      //this.filter = ''
      if (!cancelInfo) return
      this.context.function = false
      this.info()
    },

    info() {
      if (!this.context.function) {
        this.tooltip = undefined
        this.tooltipDesc = undefined
        return
      }
      const sig = this.context.function.signature
      /*const parms = this.context.function.parameters
      const parmIndex = this.context.parameterIndex
      const leftParen = sig.indexOf('(')
      const rightParen = sig.indexOf(')')
      const sigParms = sig.substring(leftParen + 1, rightParen).split(',')
      if (parms && this.context.parameterIndex < parms.length) {
        this.tooltipDesc = parms[parmIndex]
        sigParms[parmIndex] = '<span class=\\\'highlight\\\'>' + sigParms[parmIndex] + '</span>'
      }
      this.tooltip = sig.substring(0, leftParen + 1) + sigParms.join(',') + sig.substring(rightParen)*/
      this.tooltip = sig
    },

    moveCursor(steps) {
      let index = this.filteredValues.indexOf(this.activeMenuItem)
      index += steps
      if (Math.abs(steps) === 1) {
        index = Math.abs(index % this.filteredValues.length)
      } else {
        index = Math.min(Math.max(0, index), this.filteredValues.length - 1)
      }
      this.activeMenuItem = this.filteredValues[index]
    },

    // TODO: Add logic for fields ([?]. - ignore for now), keep track of current function sig parm (not trivial)
    // DONE: Don't autocomplete inside strings ("'), function sigs (()
    onInput(event/*: KeyboardEvent*/) {
      const pos = this.jar.save()
      const selectionStart = pos.start
      const selectionEnd = pos.end
      if ((/*event.target.*/selectionStart != /*event.target.*/selectionEnd) /*||
        event.altKey || event.ctrlKey || event.metaKey *//*|| event.shiftKey *//*|| event.isComposing*/) {
        this.cancel()
        return
      }

      const c = event.key
      const isPrintableKey = (c.length === 1 || c === 'Unidentified') && !(event.altKey || event.ctrlKey || event.metaKey)

      let offset = 0

      // NOTE: Pressing delete won't impact this logic
      switch(c) {
        case 'Backspace':
          offset = -1
          break
        case 'ArrowLeft':
          if (event.ctrlKey)
            offset = -/*event.target.*/selectionStart
          else
            offset = -1
          break
        case 'ArrowRight':
        if (event.ctrlKey)
            offset = /*event.target.value*/this.jar.toString().length - /*event.target.*/selectionStart
          else
            offset = +1
          break
        case 'Home':
          offset = -/*event.target.*/selectionStart
          break
        case 'End':
          offset = /*event.target.value*/this.jar.toString().length - /*event.target.*/selectionStart
          break
        case 'Enter':
        case 'Tab':
          if (this.visibleDropdown) {
            this.onClick(this.activeMenuItem)
            event.preventDefault()
          }

          // Allow to tab when suggestions are hidden
          return
        case 'Escape':
          if (this.visibleDropdown || this.tooltip) {
            this.cancel()
            event.preventDefault()
            return
          }
          break
        case 'ArrowUp':
          if (this.visibleDropdown) {
            this.moveCursor(-1)
            event.preventDefault()
            return
          }
          break
        case 'ArrowDown':
          if (this.visibleDropdown) {
            this.moveCursor(+1)
            event.preventDefault()
            return
          }
          break
        case 'PageUp':
          if (this.visibleDropdown) {
            this.moveCursor(-10)
            event.preventDefault()
            return
          }
          break
        case 'PageDown':
          if (this.visibleDropdown) {
            this.moveCursor(+10)
            event.preventDefault()
            return
          }
          break
        case ' ':
        case 'Spacebar':
          if (event.ctrlKey) {
            // Show all (contextual) values, but eat space
            //event.preventDefault()
          }
          break
        case ';':
        case ')':
          // Always break off info tooltip when closing parenthesis, or ending statement
          this.cancel()
          break
        default:
          if (!isPrintableKey) {
            return
          }
      } 

      let value = /*event.target.value*/this.jar.toString().substring(0, /*event.target.*/selectionStart + offset)

      if (isPrintableKey) value += c

      // Are we inside a string literal?
      let literalDepth = 0
      for (let i = 0; i < value.length; ++i) {
        if (value[i] === "\"" || value[i] === "\'") {
          if (literalDepth === 0) {
            literalDepth = value[i]
          } else if (literalDepth === value[i]) {
            literalDepth = 0
          }
        } else if (value[i] === "\\" && literalDepth === value[i+1]) {
          // Skip escape character (rough patch - won't catch escape sequence errors)
          ++i
        }
      }

      if (literalDepth !== 0) {
        this.cancel()
        return
      }

      value = [...value].reverse().join('')

      const matchFunction = /^[(]\s*/.exec(value)
      let mightBeFunction = false

      // A (global) function?
      if (matchFunction) {
        mightBeFunction = true

        // Check if we are indeed dealing with a function. Strip opening parenthesis, and check for next token
        value = value.slice(matchFunction.length)
      }

      // NOTE: Ignoring Unicode code points ^^ (see: https://mathiasbynens.be/notes/javascript-identifiers-es6 and https://gist.github.com/mathiasbynens/6334847)
      // Full regex (won't compile in JS): ^[$_\p{L}\p{Nl}][$_\p{L}\p{Nl}\u200C\u200D\p{Mn}\p{Mc}\p{Nd}\p{Pc}]+$
      const matchIdentifier = /^[$_a-zA-Z\u200C\u200D\d]*[$_a-zA-Z]/.exec(value)

      // An identifier, but not a field or prop or method
      if (!matchIdentifier || value[matchIdentifier.length] === '.') {
        this.cancel(mightBeFunction)
        return
      }

      // Reverse again
      value = [...matchIdentifier[0]].reverse().join('')

      if (mightBeFunction) {
        // Hide autocomplete, show hints instead
        this.cancel()

        if (this.namespace[value]?.type === 'Function' ||
          this.namespace[value]?.type === 'BuiltinFunction') {
          this.context.function = this.namespace[value]
          this.context.parameterIndex = 0
          this.info()
        }

        return
      }

      this.autocomplete(value)
    },

    iconForValue(value) {
      switch(this.namespace[value].type) {
        case 'BooleanLiteral':
          return 'mdi mdi-help'
        case 'NullLiteral':
          return 'mdi mdi-null'
        case 'BooleanBinaryOperator':
          return 'mdi mdi-chevron-up'
        case 'NumberBinaryOperator':
          return 'mdi mdi-plus-minus'
        case 'ConversionOperator':
          return 'mdi mdi-arrow-right'
        case 'StringNumericLiteral':
          return 'mdi mdi-infinity'
        case 'UndefinedKeyword':
        case 'BuiltinFunction':
          return 'mdi mdi-package-variant-closed'
        case 'Function':
          return 'mdi mdi-function'
        // TODO: ...
        case 'BooleanVariable':
        case 'NumericVariable':
        case 'StringVariable':
        case 'DateVariable':
        case 'ArrayVariable':
        case 'MatrixVariable':
        case 'ObjectVariable':
          return 'mdi mdi-variable mdialt-format-superscript'
        default:
          return 'mdi '
      }
    },

    onUpdate(code) {
      this.$emit("update", this.value = code)
    },
  },

  watch: {
    value(v) {
      const pv = this.jar.toString()
      if (v == pv) return
      const pos = this.jar.save()
      this.jar.updateCode(v)
      pos.end = pos.start += v.length - pv.length
      this.jar.restore(pos)
    }
  }
}
</script>

<template lang="pug">
div
  SharedContextMenu(
    :position="{ left: true, top: true }"
    :visible="visibleDropdown"
  )
    template(slot="opener")
      //-input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none.inputCode(
      //-  ref="conditionInput"
      //-  type="text"
      //-  :placeholder="placeholder"
      //-  :value="value"
      //-  @keydown="onInput"
      //-  @blur="cancel"
      //-  @input="event => $emit('input', event.target.value)"
      //-)
      div.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none.inputCode.language-mathjs(
        ref="conditionInput"
        contenteditable="true"
        spellcheck="false"
        data-enable-grammarly="false"
        @keydown="onInput"
        @blur="cancel"
      )

    template(slot="content")
      SharedContextMenuItem.inputCode(
        v-for="value in filteredValues"
        :active="activeMenuItem===value"
        :id="value"
        :key="value"
        :icon="iconForValue(value)"
        :title="'<span class=\\\'highlight\\\'>' + filter + '</span>' + value.substring(filter.length)"
        @onClick="onClick(value)"
      )

  SharedTooltip(
    :position="{ left: true, bottom: true }"
    :visible="!!tooltip"
  )
    template(slot="content")
      span(v-html="tooltip")
    template(slot="desc", v-if="tooltipDesc") {{ tooltipDesc }}
</template>
