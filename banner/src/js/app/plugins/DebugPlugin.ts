import type { PluginInterface } from '@/js/app/interfaces/PluginInterface'

type DebugEvent = {
  name: string
  data: unknown
}

class DebugPlugin implements PluginInterface {
  events: DebugEvent[] = []

  constructor() {
    console.log('Constructoed debug plugin');
  }

  isDefined(): boolean {
    return true
  }

  register(): void {
    window.ccDebugger = this;
  }

  logEvent(event: string, data: unknown){
    this.events.push({
      name: event,
      data: data
    })
  }

  getEvents(){
    return this.events;
  }
}

export default new DebugPlugin()
