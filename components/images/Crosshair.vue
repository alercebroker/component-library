<template>
  <v-row class="pa-0" justify="center" align="center" style="height: 100%;">
    <v-col v-for="(image, index) in images" :key="index" class="pa-0" cols="4">
      <canvas
        :ref="'canvas_' + index"
        style="width: 100%; height: 100%;"
      ></canvas>
    </v-col>
  </v-row>
</template>

<script>
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
@Component({})
export default class Crosshair extends Vue {
  @Prop({
    type: Array,
    default: () => [],
  })
  images

  @Prop({ type: Boolean, default: false })
  fullscreen

  @Prop({ type: Number, default: 20 }) crossHairSpace

  mounted() {
    this.drawImage()
  }

  drawCrosshair(x, y, w, h, ctx, sp) {
    ctx.lineWidth = 10
    ctx.strokeStyle = 'rgba(255,0,0,0.3)'
    ctx.beginPath()
    ctx.moveTo(x, h / 4)
    ctx.lineTo(x, y - sp)
    ctx.moveTo(x, y + sp)
    ctx.lineTo(x, h - h / 4)
    ctx.moveTo(w / 4, y)
    ctx.lineTo(x - sp, y)
    ctx.moveTo(x + sp, y)
    ctx.lineTo(w - w / 4, y)
    ctx.stroke()
  }

  drawImage() {
    for (let i = 0; i < this.images.length; i++) {
      const canvas = this.$refs['canvas_' + i][0]
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const drawCrosshair = this.drawCrosshair
      const sp = this.crossHairSpace
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        if (!this.error && !img.src.includes('placeholder')) {
          drawCrosshair(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width,
            canvas.height,
            ctx,
            sp
          )
          this.error = false
        }
      }
      img.onerror = () => {
        img.src = 'https://via.placeholder.com/300'
        this.error = true
      }
      img.src = this.images[i]
    }
  }

  @Watch('images')
  onImages() {
    this.drawImage()
  }
}
</script>
