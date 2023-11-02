
import { InfluxDB, Point } from '@influxdata/influxdb-client';

export class InfluxDBLogger {

  private platform: any; // eslint-disable-line
  private org: any; // eslint-disable-line
  private bucket: any; // eslint-disable-line

  private influxDB: any; // eslint-disable-line

  constructor(platform: any, config: any) { // eslint-disable-line

    this.platform = platform;
    this.org = config.influxOrg || '';
    this.bucket = config.influxBucket || '';

    const url = config.influxUrl || '';
    const token = config.influxToken || '';

    this.influxDB = new InfluxDB({ url, token });

  }

  logBooleanValue(name: string, characteristic: string, value: boolean) {

    if (this.platform.config.debugMsgLog) {
      this.platform.log.info('[%s] LOG Characteristic %s -> %s', name, characteristic, value);
    }

    const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
    writeApi.useDefaultTags({ device: String(this.platform.config.name) });

    const point1 = new Point(name)
      .intField(characteristic, this.boolToNumber(value));

    writeApi.writePoint(point1);
    writeApi.close().then(() => {
      if (this.platform.config.debugMsgLog) {
        this.platform.log.info('[%s] LOG WRITE FINISHED', name);
      }
    });

  }

  logIntegerValue(name: string, characteristic: string, value: number) {

    if (this.platform.config.debugMsgLog) {
      this.platform.log.info('[%s] LOG Characteristic %s -> %i', name, characteristic, value);
    }

    const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
    writeApi.useDefaultTags({ device: String(this.platform.config.name) });

    const point1 = new Point(name)
      .intField(characteristic, value);

    writeApi.writePoint(point1);
    writeApi.close().then(() => {
      if (this.platform.config.debugMsgLog) {
        this.platform.log.info('[%s] LOG WRITE FINISHED', name);
      }
    });

  }

  logFloatValue(name: string, characteristic: string, value: number) {

    if (this.platform.config.debugMsgLog) {
      this.platform.log.info('[%s] LOG Characteristic %s -> %f', name, characteristic, value);
    }

    const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
    writeApi.useDefaultTags({ device: String(this.platform.config.name) });

    const point1 = new Point(name)
      .floatField(characteristic, value);

    writeApi.writePoint(point1);
    writeApi.close().then(() => {
      if (this.platform.config.debugMsgLog) {
        this.platform.log.info('[%s] LOG WRITE FINISHED', name);
      }
    });

  }

  boolToNumber(bool: boolean): number {
    if (String(bool) === 'true') {
      return 1;
    }
    if (String(bool) === '1') {
      return 1;
    }
    return 0;
  }

}