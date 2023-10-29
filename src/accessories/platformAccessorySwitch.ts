import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { LoggingHomebridgePlatform } from '../platform';

import { md5 } from "../md5";

export class LoggingPlatformAccessorySwitch {
  private service: Service;

  private model: string = "Switch";

  private states = {
    On: false
  };

  constructor(
    private readonly platform: LoggingHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer,     this.platform.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model,            this.model + ' @ ' + this.platform.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber,     md5(accessory.context.device.name + this.model))
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.platform.firmwareRevision);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

  }

  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.On = value as boolean;

    this.platform.log.info('[%s] Set Characteristic On ->', this.accessory.context.device.name, value);
  }

  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.states.On;

    this.platform.log.info('[%s] Get Characteristic On ->', this.accessory.context.device.name, isOn);

    return isOn;
  }

}
