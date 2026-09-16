'use strict';

const OfferPdf=(function(){
  const BLUE=[43,143,240], NAVY=[8,24,39], INK=[28,42,55], MUTED=[102,117,130], LINE=[210,219,227], SOFT=[245,248,251], WHITE=[255,255,255];
  const PAGE_W=210, PAGE_H=297, M=14, BOTTOM=281;

  function sanitize(v){return String(v==null?'':v).replace(/\u00a0/g,' ').replace(/[\u2012\u2013\u2014\u2212]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"');}
  function money(v){return Number(v||0).toLocaleString('cs-CZ')+' Kč';}
  function date(v){if(!v)return '—';const [y,m,d]=String(v).split('-');return `${Number(d)}. ${Number(m)}. ${y}`;}
  function customerFor(o,state){
    const c=(state.contacts||[]).find(x=>x.id===o.contactId);
    return o.customer&&o.customer.name?o.customer:(c?{name:c.name,company:c.company,phone:c.phone,email:c.email,address:c.address}:null);
  }
  function newDoc(){
    if(!window.jspdf||!window.jspdf.jsPDF)throw new Error('PDF knihovna není dostupná.');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
    let f='helvetica';
    try{
      if(typeof MS_PDF_FONT_REGULAR_B64!=='undefined'&&typeof MS_PDF_FONT_BOLD_B64!=='undefined'){
        doc.addFileToVFS('DejaVuCZ.ttf',MS_PDF_FONT_REGULAR_B64); doc.addFont('DejaVuCZ.ttf','DejaVuCZ','normal');
        doc.addFileToVFS('DejaVuCZ-Bold.ttf',MS_PDF_FONT_BOLD_B64); doc.addFont('DejaVuCZ-Bold.ttf','DejaVuCZ','bold');
        f='DejaVuCZ';
      }
    }catch(e){console.warn('PDF font',e)}
    doc.__font=f; doc.setFont(f,'normal'); return doc;
  }
  function font(doc,weight='normal'){doc.setFont(doc.__font||'helvetica',weight);}
  function line(doc,y){doc.setDrawColor(...LINE);doc.setLineWidth(.25);doc.line(M,y,PAGE_W-M,y);}
  function pageHeader(doc,o,state,first=false){
    if(first){
      doc.setFillColor(...NAVY); doc.rect(0,0,PAGE_W,42,'F');
      doc.setFillColor(...BLUE); doc.rect(0,0,5,42,'F');
      font(doc,'bold'); doc.setTextColor(...WHITE); doc.setFontSize(18); doc.text(sanitize(state.settings?.company||'Moje Řemeslo'),M,17);
      font(doc,'normal'); doc.setFontSize(8.5); doc.setTextColor(196,214,228); doc.text(sanitize(state.settings?.owner||''),M,24);
      font(doc,'bold'); doc.setFontSize(10); doc.setTextColor(...BLUE); doc.text('CENOVÁ NABÍDKA',PAGE_W-M,15,{align:'right'});
      font(doc,'normal'); doc.setFontSize(8.5); doc.setTextColor(...WHITE); doc.text(`č. ${sanitize(o.number||'—')}`,PAGE_W-M,22,{align:'right'});
    }else{
      font(doc,'bold'); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.text(`CENOVÁ NABÍDKA ${sanitize(o.number||'')}`,M,10);
      line(doc,13);
    }
  }
  function footer(doc,page,total){
    doc.setDrawColor(...LINE);doc.line(M,286,PAGE_W-M,286);
    font(doc,'normal');doc.setFontSize(7);doc.setTextColor(...MUTED);
    doc.text('Vygenerováno v aplikaci Moje Řemeslo',M,291);
    doc.text(`${page} / ${total}`,PAGE_W-M,291,{align:'right'});
  }
  function addPage(doc,o,state){doc.addPage();pageHeader(doc,o,state,false);return 22;}
  function blockLabel(doc,x,y,label){font(doc,'bold');doc.setFontSize(7);doc.setTextColor(...MUTED);doc.text(sanitize(label).toUpperCase(),x,y);}
  function blockValue(doc,x,y,value,maxW){font(doc,'normal');doc.setFontSize(9.3);doc.setTextColor(...INK);const lines=doc.splitTextToSize(sanitize(value||'—'),maxW);doc.text(lines,x,y);return lines.length*4.3;}
  function recipientText(c){return [c?.company,c?.name,c?.address,c?.phone,c?.email].filter(Boolean).join('\n');}
  function supplierText(s){return [s?.owner,s?.phone,s?.email].filter(Boolean).join('\n');}

  function build(o,state){
    const doc=newDoc(); pageHeader(doc,o,state,true); let y=51;
    const c=customerFor(o,state); const isConcept=o.kind==='concept'||!c;

    font(doc,'bold');doc.setFontSize(17);doc.setTextColor(...INK);doc.text(sanitize(o.title||'Cenová nabídka'),M,y);y+=8;
    if(isConcept){
      doc.setFillColor(237,245,255);doc.setDrawColor(...BLUE);doc.rect(M,y-3,36,8,'FD');font(doc,'bold');doc.setFontSize(7.5);doc.setTextColor(...BLUE);doc.text('KONCEPT',M+4,y+2);y+=10;
    }

    const boxW=(PAGE_W-M*2-6)/2;
    doc.setFillColor(...SOFT);doc.setDrawColor(...LINE);doc.rect(M,y,boxW,29,'FD');doc.rect(M+boxW+6,y,boxW,29,'FD');
    blockLabel(doc,M+4,y+6,'Dodavatel'); blockValue(doc,M+4,y+12,state.settings?.company||'Moje Řemeslo',boxW-8); blockValue(doc,M+4,y+17,supplierText(state.settings||{}),boxW-8);
    blockLabel(doc,M+boxW+10,y+6,isConcept?'Určení':'Odběratel');
    if(isConcept) blockValue(doc,M+boxW+10,y+12,'Koncept bez konkrétního zákazníka',boxW-8);
    else blockValue(doc,M+boxW+10,y+12,recipientText(c),boxW-8);
    y+=36;

    const info=[['Datum vystavení',date(o.date)],['Platnost do',date(o.validTo)],['Nabídka č.',o.number||'—']];
    const iw=(PAGE_W-M*2-8)/3;
    info.forEach((r,i)=>{const x=M+i*(iw+4);blockLabel(doc,x,y,r[0]);blockValue(doc,x,y+5,r[1],iw);});y+=16;line(doc,y);y+=8;

    const cols=[{label:'Položka',w:82,align:'left'},{label:'Množství',w:23,align:'right'},{label:'Jedn.',w:17,align:'left'},{label:'Cena / j.',w:30,align:'right'},{label:'Celkem',w:30,align:'right'}];
    function tableHeader(){
      doc.setFillColor(...NAVY);doc.rect(M,y,PAGE_W-M*2,8,'F');font(doc,'bold');doc.setFontSize(7);doc.setTextColor(...WHITE);let x=M;
      cols.forEach(col=>{doc.text(col.label,col.align==='right'?x+col.w-2:x+2,y+5,{align:col.align==='right'?'right':'left'});x+=col.w;});y+=8;
    }
    tableHeader();
    (o.items||[]).forEach((it,idx)=>{
      font(doc,'normal');doc.setFontSize(8.3);const lines=doc.splitTextToSize(sanitize(it.name||''),78);const rh=Math.max(8,lines.length*4.1+3);
      if(y+rh>BOTTOM){y=addPage(doc,o,state);tableHeader();}
      if(idx%2===1){doc.setFillColor(...SOFT);doc.rect(M,y,PAGE_W-M*2,rh,'F');}
      doc.setTextColor(...INK);let x=M;doc.text(lines,x+2,y+5);x+=82;
      doc.text(String(Number(it.qty||0).toLocaleString('cs-CZ')),x+21,y+5,{align:'right'});x+=23;
      doc.text(sanitize(it.unit||''),x+2,y+5);x+=17;
      doc.text(money(it.price),x+28,y+5,{align:'right'});x+=30;
      doc.text(money(Number(it.qty||0)*Number(it.price||0)),x+28,y+5,{align:'right'}); y+=rh;
      doc.setDrawColor(...LINE);doc.line(M,y,PAGE_W-M,y);
    });
    y+=7;
    if(y+18>BOTTOM)y=addPage(doc,o,state);
    doc.setFillColor(237,245,255);doc.setDrawColor(...BLUE);doc.rect(PAGE_W-M-70,y,70,15,'FD');blockLabel(doc,PAGE_W-M-66,y+5,'Celkem');font(doc,'bold');doc.setFontSize(14);doc.setTextColor(...BLUE);doc.text(money((o.items||[]).reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)),PAGE_W-M-4,y+11,{align:'right'});y+=24;

    if(o.note){
      const lines=doc.splitTextToSize(sanitize(o.note),PAGE_W-M*2-8);const h=lines.length*4.5+15;if(y+h>BOTTOM)y=addPage(doc,o,state);
      doc.setFillColor(...SOFT);doc.setDrawColor(...LINE);doc.rect(M,y,PAGE_W-M*2,h,'FD');blockLabel(doc,M+4,y+6,'Poznámka');font(doc,'normal');doc.setFontSize(8.8);doc.setTextColor(...INK);doc.text(lines,M+4,y+12);y+=h+7;
    }

    if(y+22>BOTTOM)y=addPage(doc,o,state);
    line(doc,y);y+=7;font(doc,'normal');doc.setFontSize(7.5);doc.setTextColor(...MUTED);doc.text('Děkujeme za Váš zájem. Nabídka je platná do uvedeného data, není-li dohodnuto jinak.',M,y);

    const pages=doc.getNumberOfPages();for(let p=1;p<=pages;p++){doc.setPage(p);footer(doc,p,pages);}return doc;
  }
  function fileName(o){return `Nabidka_${String(o.number||'bez-cisla').replace(/[^a-zA-Z0-9_-]+/g,'_')}.pdf`;}
  function blob(o,state){return build(o,state).output('blob');}
  function download(o,state){const b=blob(o,state),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fileName(o);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);}
  async function share(o,state){
    const b=blob(o,state),file=new File([b],fileName(o),{type:'application/pdf'});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:`Cenová nabídka ${o.number}`,text:o.title||'Cenová nabídka',files:[file]});return true;}
    download(o,state);return false;
  }
  return {build,blob,download,share,fileName};
})();
