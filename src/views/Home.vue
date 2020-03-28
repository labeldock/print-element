<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
  </div>
  <div>
    <iframe
      v-if="iframeSrc"
      style="display:none"
      ref="iframe"
      :src="iframeSrc"
    ></iframe>
  </div>
  <div>
    <a :href="iframeSrc">{{ iframeSrc }}</a>
    <button @click="printFrame()">print</button>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  data: () => ({
    iframeSrc: null
  }),
  components: {},
  created() {
    const blob = new Blob(["<h1>Hello world~~</h1>"], { type: "text/html" });
    const iframeSrc = URL.createObjectURL(blob);
    this.iframeSrc = iframeSrc;
  },
  destroy() {
    const { iframeSrc } = this.$data;
    iframeSrc && URL.revokeObjectURL(iframeSrc);
  },
  methods: {
    printFrame() {
      const { contentWindow } = this.$refs.iframe;
      contentWindow.print();
    }
  }
};
</script>
