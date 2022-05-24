<template>
  <div id="app">
    <el-upload
      class="upload-demo"
      ref="upload"
      action=""
      :on-change="handleChange"
      :file-list="fileList"
      :auto-upload="false"
    >
      <el-button slot="trigger" size="small" type="primary">SELECT IMAGE</el-button>
      <el-button
        style="margin-left: 10px"
        size="small"
        type="success"
        @click="submitUpload"
        >Upload to Server</el-button
      >
      <el-button size="small" type="warning" @click="reset">RESET</el-button>
      <el-button size="small" type="success" @click="resetImg"
        >ORIGNAL IMAGE</el-button
      >
      <!-- uploading bar-->
      <el-progress
        :percentage="progressData"
        :color="customColors"
        v-if="showProgress"
      ></el-progress>
    </el-upload>
    <!-- select transfermation type -->
    <el-form ref="form" :model="form" label-width="120px" size="large">
      <!-- Flip horizontal and vertical -->
      <el-form-item label="FLIP">
        <el-select v-model="form.revolve" placeholder="SELECT" clearable>
          <el-option
            v-for="item in revolveOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!-- saturate -->
      <el-form-item label="SATURATE">
        <el-select v-model="form.saturate" placeholder="SELECT" clearable>
          <el-option
            v-for="item in saturateOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!-- Rotate left and right -->
      <el-form-item label="ROTATE">
        <el-select v-model="form.around" placeholder="SELECT" clearable>
          <el-option
            v-for="item in aroundOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!-- grayscale -->
      <el-form-item label="GREYSCALE">
        <el-switch v-model="form.greyscale"></el-switch>
      </el-form-item>
      <!-- thumbnail -->
      <el-form-item label="THUMBNAIL">
        <el-switch v-model="form.thumbnail"></el-switch>
      </el-form-item>
      <!-- select color -->
      <el-form-item label="SELECT GRAYSCALE">
        <el-color-picker
          v-model="form.tint"
          color-format="rgb"
          :show-alpha="false"
        ></el-color-picker>
      </el-form-item>
      <!-- Resizing -->
      <el-form-item label="RESIZIE">
        <span class="resizing">width</span>
        <el-input-number
          size="mini"
          v-model="form.resizing.width"
          style="margin-right: 25px"
        ></el-input-number>
        <span class="resizing">height</span>
        <el-input-number
          size="mini"
          v-model="form.resizing.height"
        ></el-input-number>
      </el-form-item>
      <!-- percentage -->
      <el-form-item label="PERCENTAGE">
        <el-slider
          v-model="form.percentage"
          show-input
          :max="100"
          :min="0"
        ></el-slider>
      </el-form-item>
      <!-- rotate degrees -->
      <el-form-item label="ROTATE DEGREES">
        <el-slider
          v-model="form.rotate"
          show-input
          :max="180"
          :min="-180"
        ></el-slider>
      </el-form-item>
    </el-form>
    <!-- Result Image -->
    <el-image :src="src" v-if="src"> </el-image>
  </div>
</template>

<script>
const baseurl = "http://localhost:3000"; //backend port
export default {
  name: "App",
  data() {
    return {
      fileList: [],
      form: {
        revolve: "",
        around: "",
        rotate: 0,
        greyscale: false,
        tint: null,
        saturate: "",
        percentage: 0,
        thumbnail:false,
        resizing: {
          width: 0,
          height: 0,
        },
      },
      saturateOption: [
        {
          label: "saturate",
          value: 5,
        },
        {
          label: "desaturate",
          value: 0.1,
        },

      ],

      revolveOptions: [
        {
          label: "vertical",
          value: "flip",
        },
        {
          label: "horizontal",
          value: "flop",
        },
      ],
      aroundOptions: [
        {
          label: "left",
          value: -90,
        },
        {
          label: "right",
          value: 90,
        },
      ],
      oldFile: {}, //file Object
      src: "",
      showProgress: false,
      customColors: [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 80 },
        { color: "#67c23a", percentage: 100 },
      ],
      progressData: 0,
    };
  },
  methods: {
    //upload image
    async submitUpload() {
      if (!this.src) return this.$message.error("Please upload image!");
      const that = this;
      const api = "/uploadImg"; //endpoint
      const data = {
        image: this.src,
        form: this.form,
      };
      const res = await this.$axios.post(baseurl + api, data, {
        headers: {
          "Content-Type": "Application/json",
        },
        onUploadProgress(progressEvent) {
          //upload progress
          const { loaded, total } = progressEvent;
          that.handleProcess(loaded, total);
        },
      });
      this.src = "data:image/jpeg;base64," + res.data;
    },
    //save orignal image as value
    handleChange(option) {
      this.oldFile = option;
      const { raw } = option;
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          this.src = reader.result;
        },
        false
      );
      reader.readAsDataURL(raw);
    },
    //progress bar
    handleProcess(loaded, total) {
      this.showProgress = true;
      this.progressData = Math.round((loaded * 100) / total);
      if (this.progressData === 100) {
        setTimeout(() => {
          this.uploadProgress = false;
          this.progressData = 0;
          this.$message.success("Upload Successful!");
        }, 500);
        this.showProgress = false;
      }
    },
    //reset image
    reset() {
      this.form = this.$options.data.call(this).form;
    },
    //reset orignal image
    resetImg() {
      const { raw } = this.oldFile;
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          this.src = reader.result;
        },
        false
      );
      reader.readAsDataURL(raw);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.upload-demo {
  margin-bottom: 10px;
}
.resizing {
  margin-right: 15px;
}
</style>
