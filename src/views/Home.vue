<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
  </div>
  <div>
    <pre>{{ { readyPrintForm } }}</pre>
    <h3>printElement</h3>
    <div style="border:1px solid silver">
      <div ref="printArea">
        <h1>Hello world</h1>
        <p>Print descrition</p>
      </div>
    </div>

    <h3>printRaw</h3>
    <div>
      {{ printRaw }}
    </div>

    <h3>printSrc</h3>
    <div>
      <a :href="printSrc">{{ printSrc }}</a>
    </div>

    <button @click.prevent="printNow">printNow</button>
  </div>
</template>

<script>
// @ is an alias to /src
import { ref, onMounted, onUnmounted, computed } from "vue";
import { createPrintForm } from "@/shared/printElement";
export default {
  name: "Home",
  setup() {
    const printArea = ref();
    const printCtrl = ref(null);

    function initPrint(element) {
      const printForm = createPrintForm(element);
      printCtrl.value = printForm;
    }

    onMounted(() => {
      initPrint(printArea.value);
    });

    onUnmounted(() => {
      const { value: printCtrlValue } = printCtrl;
      if (printCtrlValue) {
        printCtrlValue.destroy();
      }
    });

    const readyPrintForm = computed(() => {
      return Boolean(printCtrl.value);
    });

    const printRaw = computed(() => {
      const { value: printCtrlValue } = printCtrl;
      if (!printCtrlValue) return;
      return printCtrlValue.html;
    });

    const printSrc = computed(() => {
      const { value: printCtrlValue } = printCtrl;
      if (!printCtrlValue) return;
      return printCtrlValue.fregmentUrl;
    });

    function printNow() {
      console.log("printNow");
      const { value: printCtrlValue } = printCtrl;
      if (!printCtrlValue) return;
      printCtrlValue.print();
    }

    return {
      readyPrintForm,
      printRaw,
      printSrc,
      printNow,
      printArea
    };
  }
};
</script>
