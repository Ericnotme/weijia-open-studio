// One active request. Late replies after stop/reset never enter visible history.
export class ChatController {
  sequence=0; active=null;
  begin() { if(this.active) return null; const ticket={id:++this.sequence,abort:new AbortController()}; this.active=ticket; return ticket; }
  current(ticket) { return this.active===ticket && !ticket.abort.signal.aborted; }
  finish(ticket) { if(this.active===ticket)this.active=null; }
  cancel() { this.active?.abort.abort(); this.active=null; this.sequence++; }
}
