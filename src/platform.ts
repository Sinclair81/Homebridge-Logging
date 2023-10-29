import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
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
    this.log.debug('Finished initializing platform:', this.config.name);

    this.logType     = this.config.logType     || logTypeFakegato;
    this.logPort     = this.config.logPort     || 9999;
    this.debugMsgLog = this.config.debugMsgLog || 0;

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
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
    //this.log.info('Loading accessory from cache:', accessory.displayName);
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    //this.accessories.push(accessory);
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
      },
    ];

    // loop over the discovered devices and register each one if it has not already been registered
    for (const device of exampleDevices) {

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        new LoggingPlatformAccessory(this, existingAccessory);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.exampleDisplayName);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        new LoggingPlatformAccessory(this, accessory);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
