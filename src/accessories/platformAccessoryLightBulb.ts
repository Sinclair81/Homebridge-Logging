import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { LoggingHomebridgePlatform } from '../platform';

import { md5 } from "../md5";

export class LoggingPlatformAccessoryLightBulb {
  private service: Service;

  private model: string = "LightBulb";
  public name: string;

  private states = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: LoggingHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.name = accessory.context.device.name;

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer,     this.platform.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model,            this.model + ' @ ' + this.platform.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber,     md5(accessory.context.device.name + this.model))
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.platform.firmwareRevision);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(this.getBrightness.bind(this));       // GET - bind to the 'getBrightness` method below

    if (this.platform.logType === this.platform.logTypeFakegato) {

      // this.fakegatoService = new this.platform.FakeGatoHistoryService("custom", this, {storage: 'fs'});
      // this.services.push(this.fakegatoService);
      
    }

    setInterval(() => {
      this.logAccessory();
    }, this.platform.logInterval);
  }

  async getOn(): Promise<CharacteristicValue> {

    if (this.platform.config.debugMsgLog || this.accessory.context.device.debugMsgLog) {
      this.platform.log.info('[%s] Get Characteristic On -> %s', this.accessory.context.device.name, this.states.On);
    }
    return this.states.On;
  }

  async getBrightness(): Promise<CharacteristicValue> {

    if (this.platform.config.debugMsgLog || this.accessory.context.device.debugMsgLog) {
      this.platform.log.info('[%s] Get Characteristic Brightness -> %i', this.accessory.context.device.name, this.states.Brightness);
    }
    return this.states.Brightness;
  }

  async checkUdpMsg(array) {

    if (array[1] === "On") {

      this.states.On = array[2] as boolean;

      if (this.platform.config.debugMsgLog || this.accessory.context.device.debugMsgLog) {
        this.platform.log.info('[%s] Update Characteristic On <- %s', this.accessory.context.device.name, this.states.On);
      }

      this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
    }

    if (array[1] === "Brightness") {

      this.states.Brightness = array[2] as number;

      if (this.platform.config.debugMsgLog || this.accessory.context.device.debugMsgLog) {
        this.platform.log.info('[%s] Update Characteristic Brightness <- %i', this.accessory.context.device.name, this.states.Brightness);
      }

      this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.states.Brightness);
    }

  }

  async logAccessory() {

    if (this.platform.logType === this.platform.logTypeInfluxDB) {

      this.platform.influxDB.logBooleanValue(this.accessory.context.device.name, "On", this.states.On);
      this.platform.influxDB.logIntegerValue(this.accessory.context.device.name, "Brightness", this.states.Brightness);
      
    }

    if (this.platform.logType === this.platform.logTypeFakegato) {

      // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});

    }
    
  }

}
