import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { LoggingHomebridgePlatform } from '../platform';

import { md5 } from "../md5";

export class LoggingPlatformAccessorySwitch {
  private service: Service;

  private model: string = "Switch";
  public name: string;

  private states = {
    On: false
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

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

  }

  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.On = value as boolean;

    this.platform.log.info('[%s] Set Characteristic On <- %s', this.accessory.context.device.name, this.states.On);
  }

  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on

    this.platform.log.info('[%s] Get Characteristic On -> %s', this.accessory.context.device.name, this.states.On);

    return this.states.On;
  }

  async checkUdpMsg(array) {
    // "name|characteristic|value"

    if (array[1] === "On") {

      this.states.On = array[2] as boolean;

      this.platform.log.info('[%s] Update Characteristic On <- %s', this.accessory.context.device.name, this.states.On);

      this.service.updateCharacteristic(this.platform.Characteristic.On, this.states.On);
    }

 }

}
