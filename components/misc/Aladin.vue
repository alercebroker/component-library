<template>
  <div id="aladin-lite-div" class="ma-0 pa-0"></div>
</template>

<script>
import {
  Vue,
  Component,
  Prop,
  Watch,
  Model,
  Emit,
} from 'nuxt-property-decorator'
import * as A from '@cquiroz/aladin-lite/lib/js/A'
/**
 * Description of aladin
 * @version 0.0.1
 */
@Component
export default class Aladin extends Vue {
  @Model('objectSelected', { type: Object, default: null }) selectedObject

  @Prop({ type: Array, default: () => [] }) objects

  @Prop({ type: Number, default: 2 }) circleSize

  @Prop({ type: String, default: null }) displayClass

  @Prop({ type: Boolean, default: true }) showCloseObjects

  @Prop({ type: Number, default: 0.03 }) fov

  aladinObject = null
  aladin = null
  catalog = null

  customZoom(event) {
    event.preventDefault()
    event.stopPropagation()
    let level = this.aladin.view.zoomLevel
    const delta = -event.deltaY

    if (delta > 0) {
      level += 1
    } else {
      level -= 1
    }
    this.aladin.view.setZoomLevel(level)
    return false
  }

  mounted() {
    this.aladin = A.aladin('#aladin-lite-div', {
      survey: 'P/PanSTARRS/DR1/color-z-zg-g',
      fov: this.fov,
      cooFrame: 'J2000d',
    })
    if (this.objects) {
      this.catalog = this.addObjects(this.aladin, this.objects)
    }
    this.onSelectedObjectChange(this.selectedObject)
    this.aladin.view.reticleCanvas.onwheel = this.customZoom
  }

  @Emit('objectSelected')
  onClick(object) {
    if (object) {
      return this.findZTFObject(object)
    } else {
      this.aladinObject = null
      return {}
    }
  }

  findZTFObject(object) {
    return this.objects.find((x) => {
      return x.oid === object.data.name
    })
  }

  draw(source, canvasCtx, viewParams) {
    canvasCtx.beginPath()
    canvasCtx.arc(
      source.x,
      source.y,
      source.data.size * 2,
      0,
      2 * Math.PI,
      false
    )
    canvasCtx.closePath()
    canvasCtx.strokeStyle = '#c38'
    canvasCtx.lineWidth = 3
    canvasCtx.globalAlpha = 0.7
    canvasCtx.stroke()
    const fov = Math.max(viewParams.fov[0], viewParams.fov[1])
    // object name is displayed only if fov<10°
    if (fov > 10) {
      return
    }
    canvasCtx.globalAlpha = 0.9
    canvasCtx.globalAlpha = 1
    const xShift = 20
    canvasCtx.font = '15px Arial'
    canvasCtx.fillStyle = '#eee'
    canvasCtx.fillText(source.data.name, source.x + xShift, source.y - 4)
    // object type is displayed only if fov<2°
    if (fov > 2) {
      return
    }
    canvasCtx.font = '12px Arial'
    canvasCtx.fillStyle = '#abc'
    canvasCtx.fillText(source.data.class, source.x + 2 + xShift, source.y + 10)
  }

  // @Watch('objects')
  addObjects(aladin, objects) {
    aladin.removeLayers()
    const sources = []
    objects.forEach((object) => {
      sources.push(
        A.source(object.meanra, object.meandec, {
          name: object.oid,
          size: this.circleSize,
          class: object[this.displayClass] ? object[this.displayClass] : '',
        })
      )
    })
    const catalog = A.catalog({ sourceSize: 10, shape: this.draw })
    catalog.addSources(sources)
    aladin.addCatalog(catalog)
    aladin.on('objectClicked', this.onClick)
    // this.aladin.on("objectHovered", this.onHover);
    return catalog
  }

  addCatalogsInformation(coordinates) {
    if (!this.showCloseObjects || !this.aladin) {
      return
    }
    this.aladin.addCatalog(
      A.catalogFromSimbad(coordinates, 0.014, {
        onClick: 'showTable',
      })
    )
    this.aladin.addCatalog(
      A.catalogFromNED(coordinates, 0.014, {
        onClick: 'showTable',
        shape: 'plus',
      })
    )
    this.aladin.addCatalog(
      A.catalogFromVizieR('I/311/hip2', coordinates, 0.014, {
        onClick: 'showTable',
      })
    )
  }

  @Watch('selectedObject')
  onSelectedObjectChange(newObject) {
    const coordinates = {
      ra: newObject.meanra,
      dec: newObject.meandec,
    }
    this.addCatalogsInformation(coordinates)
    const src = this.catalog.sources.find((source) => {
      return source.data.name === newObject.oid
    })
    this.aladinObject = src
    this.aladin.gotoRaDec(coordinates.ra, coordinates.dec)
    // this.aladin.setFov(this.fov)
  }

  @Watch('aladinObject')
  onAladinObjectChange(newObject, oldObject) {
    if (newObject) newObject.select()
    if (oldObject) oldObject.deselect()
  }
}
</script>

<style>
#aladin-lite-div {
  height: '100%';
  width: '100%';
  min-height: 350px;
}
</style>
