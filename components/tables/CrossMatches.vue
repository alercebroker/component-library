<template>
  <v-container fluid>
    <v-row>
      <v-col md="1">Max. distance</v-col>
      <v-col md="11">
        <v-slider v-model="distance" step="0.001" :min="0" :max="20">
          <template v-slot:append>
            <v-text-field
              v-model="distance"
              prepend-icon="mdi-ruler"
              class="mt-0 pt-0"
              type="number"
              :min="0"
              :max="20"
              step="0.1"
              style="width: 175px;"
              suffix="arcsec"
            ></v-text-field>
          </template>
        </v-slider>
      </v-col>
    </v-row>
    <v-row>
      <v-expansion-panels>
        <v-expansion-panel v-for="(item, idx) in filtered" :key="idx">
          <v-expansion-panel-header>
            <v-row>
              <v-col align-center>
                <h6 class="title">
                  {{ item.name }}
                  <span class="ml-1 caption grey--text text--lighten-1"
                    >({{ Object.keys(item.values).length }} attributes)</span
                  >
                </h6>
              </v-col>
              <v-col xs6 class="text--secondary">
                <p class="text-sm-right">
                  Distance:
                  {{
                    item.distance.value.toFixed(3) + ' ' + item.distance.unit
                  }}
                </p>
              </v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-data-table
              :headers="header"
              :items="item.values"
              hide-default-footer
              disable-filtering
              disable-pagination
              dense
            ></v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-footer class="caption transparent">
      <v-spacer />
      <p class="mb-0">
        Provided by
        <a href="https://github.com/maayane/catsHTM" target="_blank">
          catsHTM
        </a>
      </p>
    </v-footer>
  </v-container>
</template>
<script>
import { Vue, Component, Prop } from 'nuxt-property-decorator'
@Component
export default class CrossMatches extends Vue {
  distance = 10

  header = [
    {
      text: 'Attribute',
      value: 'field',
      sortable: false
    },
    {
      text: 'Value',
      value: 'value',
      sortable: false
    },
    {
      text: 'Unit',
      value: 'unit',
      sortable: false
    }
  ]

  @Prop({ type: Array, required: true, default: () => [] })
  catalogs

  get filtered() {
    if (this.distance == null) {
      return this.catalogs
    } else {
      return this.catalogs.filter(x => this.distance >= x.distance.value)
    }
  }
}
</script>
