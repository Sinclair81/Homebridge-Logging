
import { InfluxDB, Point } from '@influxdata/influxdb-client';

export class InfluxDBLogger {

  private platform: any;
  private org: any;
  private bucket: any;
  
  private influxDB: any;

  constructor(platform: any, config: any) {

    this.platform = platform;
    this.org      = config.influxOrg;
    this.bucket   = config.influxBucket;

    const url   = config.influxUrl;
    const token = config.influxToken;

    this.influxDB = new InfluxDB({ url, token });

  }

  logValue(name: string, characteristic: string, value: number) {

    const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);

    writeApi.useDefaultTags({ device: String(this.platform.name) });

    // Point('temperature')       -->> r._measurement == 'temperature'
    // .floatField('value', 24.0) -->> r._field == "value"

    const point1 = new Point(name)
      .floatField(characteristic, value);

    this.platform.log.info('[%s] LOG Characteristic %s -> %i', name, characteristic, value);

    writeApi.writePoint(point1);
    writeApi.close().then(() => {
      this.platform.log.info('[%s] LOG WRITE FINISHED', name);
    })

  }
    
}