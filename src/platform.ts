import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LoggingPlatformAccessoryLightBulb } from './platformAccessoryLightBulb';
import { LoggingPlatformAccessory } from './platformAccessory';

const logTypeFakegato: string = "fakegato";
const logTypeInfraDB: string  = "infraDB";


export class LoggingHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public logType: string;
  public logPort: number;
  public debugMsgLog: number;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    // this.log.debug('Finished initializing platform:', this.config.name);

    this.logType     = this.config.logType     || logTypeFakegato;
    this.logPort     = this.config.logPort     || 9999;
    this.debugMsgLog = this.config.debugMsgLog || 0;

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

    /*

    if (Array.isArray(this.config.devices)) {

      const configDevices = this.config.devices;

      for (const device of configDevices) {

        if (this.config.debugMsgLog == true) {
          this.log.info('Adding new accessory:', device.name);
        }

        switch (device.type) {
          case "switch": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new SwitchPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;
      
          case "lightbulb": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new LightbulbPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 2;
            break;

          case "blind": // ??? valvePosition	valvePosition in percentage
            this.accessoriesArray.push( new BlindPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 3;
            break;
          
          case "window": // ??? valvePosition	valvePosition in percentage
            this.accessoriesArray.push( new WindowPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 3;
            break;

          case "garagedoor": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new GaragedoorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 3;
            break;

          case "thermostat": // temp	Temperature in celcius ( value averaged over 10 minutes )
            this.accessoriesArray.push( new ThermostatPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 4;
            break;

          case "valve": // status	switch status ( 0 / 1 )
            if (!(device.valveParentIrrigationSystem)){
              this.accessoriesArray.push( new ValvePlatformAccessory(this.api, this, device) );
            }
            this.queueMinSize += 5;
            break;

          case "fan": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new FanPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 3;
            break;

          case "filterMaintenance": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new FilterMaintenancePlatformAccessory(this.api, this, device) );
            this.queueMinSize += 2;
            break;

          case "lightSensor": // lux	light level in lux
            this.accessoriesArray.push( new LightSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "motionSensor": // motion	motion sensor state ( 0 / 1 )
            this.accessoriesArray.push( new MotionSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "contactSensor": // contact	contact sensor state ( 0 / 1 )
            this.accessoriesArray.push( new ContactSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "smokeSensor": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new SmokeSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "temperatureSensor": // temp	Temperature in celcius ( value averaged over 10 minutes )
            this.accessoriesArray.push( new TemperatureSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "humiditySensor": // humidity	humidity in percentage ( value averaged over 10 minutes )
            this.accessoriesArray.push( new HumiditySensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "carbonDioxideSensor": // ??? ppm	Parts per million || voc	µg/m3
            this.accessoriesArray.push( new CarbonDioxideSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 3;
            break;

          case "airQualitySensor": // ??? ppm	Parts per million || voc	µg/m3
            this.accessoriesArray.push( new AirQualitySensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;

          case "leakSensor": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new LeakSensorPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 2;
            break;

          case "outlet": // status	switch status ( 0 / 1 )
            this.accessoriesArray.push( new OutletPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;
        
          default:
            this.accessoriesArray.push( new SwitchPlatformAccessory(this.api, this, device) );
            this.queueMinSize += 1;
            break;
        }

      }
    }

    */

    // Remove all old accessories
    for (const oldAccessory of this.accessories) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [oldAccessory]);
      // this.log.info('Removing existing accessory from cache:', oldAccessory.displayName);
    }

    // EXAMPLE ONLY
    // A real plugin you would discover accessories from the local network, cloud services
    // or a user-defined array in the platform config.
    const exampleDevices = [
      {
        exampleUniqueId: 'ABCD',
        exampleDisplayName: 'Bedroom',
      },
      {
        exampleUniqueId: 'EFGH',
        exampleDisplayName: 'Kitchen',
      }
    ];

    for (const device of exampleDevices) {

      const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);
        
      this.log.info('Adding new accessory:', device.exampleDisplayName);

      const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid);
      accessory.context.device = device;
      new LoggingPlatformAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      
    }
  }
}
