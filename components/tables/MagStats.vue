<template>
  <v-data-table
    :headers="headers"
    :items="stats"
    :hide-default-footer="hideDefaultFooter"
    :items-per-page="itemsPerPage"
    :dense="dense"
    :mobile-breakpoint="250"
  />
</template>

<script>
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
@Component
export default class MagStats extends Vue {
  /**
   * The statistics to show
   * The elements of the array should be ordered by columns
   * @example
   * {col1: 'val1', col2: 'val2'}
   */
  @Prop({ type: Array, required: true }) stats

  @Prop({ type: Boolean, default: true }) dense

  @Prop({ type: Boolean, default: true }) hideDefaultFooter
  @Prop({ type: Number, default: 15 }) itemsPerPage

  headers = []

  setHeaders(stats) {
    this.headers = []
    if (stats.length) {
      Object.keys(stats[0]).forEach((k) => {
        this.headers.push({
          text: k,
          value: k,
        })
      })
    }
  }

  mounted() {
    this.setHeaders(this.stats)
  }

  @Watch('stats')
  onStatsChanged(newVal) {
    this.setHeaders(newVal)
  }
}
</script>
