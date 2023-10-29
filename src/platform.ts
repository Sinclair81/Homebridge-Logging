import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME }        from './settings';
import { LoggingPlatformAccessory }          from './accessories/platformAccessory_multi';
import { LoggingPlatformAccessoryLightBulb } from './accessories/platformAccessoryLightBulb';

const pjson = require('../package.json');

const logTypeFakegato: string = "fakegato";
const logTypeInfraDB: string  = "infraDB";

export class LoggingHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public logType: string;
  public logPort: number;
  public debugMsgLog: number;

  public manufacturer:     string;
  public model:            string;
  public firmwareRevision: string;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    // this.log.debug('Finished initializing platform:', this.config.name);

    this.logType     = this.config.logType     || logTypeFakegato;
    this.logPort     = this.config.logPort     || 9999;
    this.debugMsgLog = this.config.debugMsgLog || 0;

    this.manufacturer     = pjson.author.name;
    this.model            = pjson.model;
    this.firmwareRevision = pjson.version;

    this.api.on('didFinishLaunching', () => {
      // log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });

    const UDP = require('dgram')
    const server = UDP.createSocket('udp4')

    server.on('listening', () => {
      // Server address it’s using to listen
      const address = server.address()
      log.info('Listining to ', 'Address: ', address.address, 'Port: ', address.port)
    })

    server.on('message', (message, info) => {
      log.info('Message', message.toString())
      const response = Buffer.from('Message Received')
      //sending back response to client
      server.send(response, info.port, info.address, (err) => {
        if (err) {
          log.error('Failed to send response !!')
        } else {
          log.info('Response send Successfully')
        }
      })
    })

    server.bind(this.logPort)

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

        if (this.config.debugMsgLog == true) {
          this.log.info('Adding new accessory:', device.name);
        }

        const uuid = this.api.hap.uuid.generate(device.name);
        const accessory = new this.api.platformAccessory(device.name, uuid);
        accessory.context.device = device;

        switch (device.type) {
          case "switch": // status	switch status ( 0 / 1 )
            
            break;
      
          case "lightbulb": // status	switch status ( 0 / 1 )
            new LoggingPlatformAccessoryLightBulb(this, accessory);
            break;

          case "blind": // ??? valvePosition	valvePosition in percentage
            
            break;
          
          case "window": // ??? valvePosition	valvePosition in percentage
            
            break;

          case "garagedoor": // status	switch status ( 0 / 1 )
            
            break;

          case "thermostat": // temp	Temperature in celcius ( value averaged over 10 minutes )
            
            break;

          case "valve": // status	switch status ( 0 / 1 )
            
            break;

          case "fan": // status	switch status ( 0 / 1 )
            
            break;

          case "filterMaintenance": // status	switch status ( 0 / 1 )
            
            break;

          case "lightSensor": // lux	light level in lux
            
            break;

          case "motionSensor": // motion	motion sensor state ( 0 / 1 )
            
            break;

          case "contactSensor": // contact	contact sensor state ( 0 / 1 )
            
            break;

          case "smokeSensor": // status	switch status ( 0 / 1 )
            
            break;

          case "temperatureSensor": // temp	Temperature in celcius ( value averaged over 10 minutes )
            
            break;

          case "humiditySensor": // humidity	humidity in percentage ( value averaged over 10 minutes )
            
            break;

          case "carbonDioxideSensor": // ??? ppm	Parts per million || voc	µg/m3
            
            break;

          case "airQualitySensor": // ??? ppm	Parts per million || voc	µg/m3
            
            break;

          case "leakSensor": // status	switch status ( 0 / 1 )
            
            break;

          case "outlet": // status	switch status ( 0 / 1 )
            
            break;
        
          default:
            new LoggingPlatformAccessory(this, accessory);
            break;
        }

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

      }
    }

  }
}
