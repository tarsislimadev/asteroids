export class PlayerSensorsDataEvent extends CustomEvent {
  static NAME = 'player.sensor.data'

  constructor({ data = {} } = {}) {
    super(PlayerSensorsDataEvent.NAME, { detail: { data } })
  }
}
