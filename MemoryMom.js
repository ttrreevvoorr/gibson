"use strict"
/**
 * MEMORY MOM
 * I got the tests back. I definitely have breast cancer.
 * https://www.youtube.com/watch?v=tXUBt0hF-y8&t=20
 * ------------------
 * The "database" is stored in memory in the constructor
 * MemoryMom should be instantiated only once in the application.
 * ------------------
 * 
*/
 
class MemoryMom {
  constructor() {
    this.serverContructs = {}
  }

  setServerConnection(guildId, options, override = false){
    if(override) return this.serverContructs[guildId] = options
    return this.serverContructs[guildId] = {
      ...this.serverContructs[guildId],
      ...options
    }
  }

  getServerContruct(guildId) {
    if( !guildId ) return false
    if (!this.serverContructs[guildId]) {
      this.serverContructs[guildId] = {
        songs: []
      }
    }
    return this.serverContructs[guildId]
  }

  appendToServerQueue(guildId, song) {
    if( !guildId || !song) return false
    this.serverContructs[guildId] = this.getServerContruct(guildId)
    this.serverContructs[guildId].songs = [ 
      ...this.serverContructs[guildId].songs,
      song
    ]
    return this.serverContructs[guildId]
  }

  setServerQueue(guildId, queue) {
    if( !guildId || !queue) return false
    this.serverContructs[guildId] = {
      ...this.serverContructs[guildId],
      songs: queue
    }
    return this.serverContructs[guildId]
  }

}

module.exports = MemoryMom
