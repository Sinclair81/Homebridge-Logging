import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { LoggingHomebridgePlatform } from '../platform';

import { md5 } from "../md5";

export class LoggingPlatformAccessoryLightBulb {
  private service: Service;

  private model: string = "LightBulb";

  private states = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: LoggingHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer,     this.platform.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model,            this.model + ' @ ' + this.platform.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber,     md5(accessory.context.device.exampleDisplayName + this.model))
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.platform.firmwareRevision);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))        // SET - bind to the 'setBrightness` method below
      .onGet(this.getBrightness.bind(this));       // GET - bind to the 'getBrightness` method below

  }

  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.On = value as boolean;

    this.platform.log.info('[%s] Set Characteristic On ->', this.accessory.context.device.exampleDisplayName, value);
  }

  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.states.On;

    this.platform.log.info('[%s] Get Characteristic On ->', this.accessory.context.device.exampleDisplayName, isOn);

    return isOn;
  }

  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.states.Brightness = value as number;

    this.platform.log.info('[%s] Set Characteristic Brightness -> ', this.accessory.context.device.exampleDisplayName, value);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isBrightness = this.states.Brightness;

    this.platform.log.info('[%s] Get Characteristic Brightness ->', this.accessory.context.device.exampleDisplayName, isBrightness);

    return isBrightness;
  }

}
