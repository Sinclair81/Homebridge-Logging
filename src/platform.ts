import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { InfluxDBLogger } from "./influxDB";
import { LoggingPlatformAccessory } from './accessories/platformAccessory_multi';
import { LoggingPlatformAccessorySwitch } from './accessories/platformAccessorySwitch';
import { LoggingPlatformAccessoryOutlet } from './accessories/platformAccessoryOutlet';
import { LoggingPlatformAccessoryLightBulb } from './accessories/platformAccessoryLightBulb';


const pjson = require('../package.json'); // eslint-disable-line
const UDP = require('dgram'); // eslint-disable-line

export class LoggingHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];
  public readonly serverAccessories: any = []; // eslint-disable-line

  public logTypeInfluxDB = 'influxDB';
  public logTypeFakegato = 'fakegato';

  public logType: string;
  public logInterval: number;
  public logPort: number;
  public debugMsgLog: number;

  public manufacturer: string;
  public model: string;
  public firmwareRevision: string;

  public influxDB: InfluxDBLogger; 

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    // this.log.debug('Finished initializing platform:', this.config.name);

    this.logType = this.config.logType || this.logTypeInfluxDB;
    this.logInterval = this.config.logInterval || 300000; // 5min
    this.logPort = this.config.logPort || 10002;
    this.debugMsgLog = this.config.debugMsgLog || 0;

    this.manufacturer = pjson.author.name;
    this.model = pjson.model;
    this.firmwareRevision = pjson.version;

    this.influxDB = new InfluxDBLogger(this, this.config);

    this.api.on('didFinishLaunching', () => {
      // log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });

    const server = UDP.createSocket('udp4');

    server.on('listening', () => {
      const address = server.address();
      if (this.debugMsgLog) {
        log.info('Listining to Address: %s at Port: %s', address.address, address.port);
      }
    });

    server.on('message', (message, info) => {
      const msg = message.toString();
      if (this.debugMsgLog) {
        log.info('Receive Message: %s', msg);
      }

      if (msg.indexOf('|') !== -1) {
        const array = msg.split('|'); // "name|characteristic|value"
        const accessory = this.serverAccessories.find(accessory => accessory.name === array[0]);
        if (accessory) {
          accessory.checkUdpMsg(array);
        }
      }

      const response = Buffer.from('Message Received');
      //sending back response to client
      server.send(response, info.port, info.address, (err) => {
        if (this.debugMsgLog) {
          if (err) {
            log.error('Failed to send response !!');
          }
        }
      });
    });

    server.bind(this.logPort);

    if (this.config.logType === this.logTypeInfluxDB) {
      /******************************************
       * add code here only needed for InfluxDB *
       ******************************************/
    }

    if (this.config.logType === this.logTypeFakegato) {
      /******************************************
       * add code here only needed for Fakegato *
       ******************************************/
    }

  }

  configureAccessory(accessory: PlatformAccessory) {
    // this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {

    // Remove all old accessories
    for (const oldAccessory of this.accessories) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [oldAccessory]);
      // this.log.info('Removing existing accessory from cache:', oldAccessory.displayName);
    }

    if (Array.isArray(this.config.devices)) {

      const configDevices = this.config.devices;

      for (const device of configDevices) {

        let name = device.displayName || String("[L] " + device.name);
        device.displayName = name;

        if (this.config.debugMsgLog) {
          this.log.info('Adding new accessory:', name);
        }

        const uuid = this.api.hap.uuid.generate(name);
        const accessory = new this.api.platformAccessory(name, uuid);
        accessory.context.device = device;
    
        let serverAccessory: any; // eslint-disable-line

        switch (device.type) {
          case 'switch': // status	switch status ( 0 / 1 )
            serverAccessory = new LoggingPlatformAccessorySwitch(this, accessory);
            break;

          case 'outlet': // status	switch status ( 0 / 1 )
            serverAccessory = new LoggingPlatformAccessoryOutlet(this, accessory);
            break;

          case 'lightbulb': // status	switch status ( 0 / 1 )
            serverAccessory = new LoggingPlatformAccessoryLightBulb(this, accessory);
            break;

          case 'blind': // ??? valvePosition	valvePosition in percentage

            break;

          case 'window': // ??? valvePosition	valvePosition in percentage

            break;

          case 'garagedoor': // status	switch status ( 0 / 1 )

            break;

          case 'thermostat': // temp	Temperature in celcius ( value averaged over 10 minutes )

            break;

          case 'valve': // status	switch status ( 0 / 1 )

            break;

          case 'fan': // status	switch status ( 0 / 1 )

            break;

          case 'filterMaintenance': // status	switch status ( 0 / 1 )

            break;

          case 'lightSensor': // lux	light level in lux

            break;

          case 'motionSensor': // motion	motion sensor state ( 0 / 1 )

            break;

          case 'contactSensor': // contact	contact sensor state ( 0 / 1 )

            break;

          case 'smokeSensor': // status	switch status ( 0 / 1 )

            break;

          case 'temperatureSensor': // temp	Temperature in celcius ( value averaged over 10 minutes )

            break;

          case 'humiditySensor': // humidity	humidity in percentage ( value averaged over 10 minutes )

            break;

          case 'carbonDioxideSensor': // ??? ppm	Parts per million || voc	µg/m3

            break;

          case 'airQualitySensor': // ??? ppm	Parts per million || voc	µg/m3

            break;

          case 'leakSensor': // status	switch status ( 0 / 1 )

            break;

          default:
            serverAccessory = new LoggingPlatformAccessory(this, accessory);
            break;
        }

        this.serverAccessories.push(serverAccessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

      }
    }

  }

}
