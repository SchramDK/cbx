export type StockItem = {
  id: string;
  src: string;
  title: string;
  tags: string[];
  mime: string;            // image/jpeg | image/png | video/mp4 | image/svg+xml
  has_people: boolean;
  dominant_color: string;  // hex
  width?: number;
  height?: number;
  alt?: string;
};

export const STOCK: StockItem[] = [
  { id:'st-001', src:'https://picsum.photos/id/1003/1600/1066', title:'Forest river', tags:['nature','forest','river','water'], mime:'image/jpeg', has_people:false, dominant_color:'#3a5a44', width:1600, height:1066, alt:'Forest river' },
  { id:'st-002', src:'https://picsum.photos/id/1015/1600/1066', title:'Mountains lake', tags:['mountain','lake','nature'], mime:'image/jpeg', has_people:false, dominant_color:'#6b879a', width:1600, height:1066, alt:'Mountains' },
  { id:'st-003', src:'https://picsum.photos/id/1016/1600/1066', title:'Beach', tags:['beach','ocean','summer'], mime:'image/jpeg', has_people:true, dominant_color:'#8ac0d6', width:1600, height:1066, alt:'Beach' },
  { id:'st-004', src:'https://picsum.photos/id/1018/1600/1066', title:'Forest trail', tags:['forest','trail','green'], mime:'image/jpeg', has_people:false, dominant_color:'#2e5b3c', width:1600, height:1066, alt:'Forest' },
  { id:'st-005', src:'https://picsum.photos/id/1020/1600/1066', title:'Lake view', tags:['lake','mountain','travel'], mime:'image/jpeg', has_people:true, dominant_color:'#4a7a8e', width:1600, height:1066, alt:'Lake' },
  { id:'st-006', src:'https://picsum.photos/id/1011/1600/1066', title:'City skyline', tags:['city','skyline','urban'], mime:'image/jpeg', has_people:true, dominant_color:'#2a2a2a', width:1600, height:1066, alt:'City skyline' },
  { id:'st-007', src:'https://picsum.photos/id/1012/1600/1066', title:'City bridge', tags:['city','bridge','architecture'], mime:'image/jpeg', has_people:false, dominant_color:'#4b5b6a', width:1600, height:1066, alt:'Bridge' },
  { id:'st-008', src:'https://picsum.photos/id/1013/1600/1066', title:'Street life', tags:['street','city','people'], mime:'image/jpeg', has_people:true, dominant_color:'#6f7a88', width:1600, height:1066, alt:'Street' },
  { id:'st-009', src:'https://picsum.photos/id/1014/1600/1066', title:'Harbor', tags:['harbor','sea','city'], mime:'image/jpeg', has_people:false, dominant_color:'#8aa0b5', width:1600, height:1066, alt:'Harbor' },
  { id:'st-v001', src:'https://picsum.photos/id/1054/1600/1066', title:'Line shapes vector', tags:['vector','lines','abstract'], mime:'image/svg+xml', has_people:false, dominant_color:'#3a86ff', width:1600, height:1066, alt:'Vector lines' },
  { id:'st-v002', src:'https://picsum.photos/id/1055/1600/1066', title:'Color blocks vector', tags:['vector','abstract','blocks'], mime:'image/svg+xml', has_people:false, dominant_color:'#ff006e', width:1600, height:1066, alt:'Vector blocks' },
  { id:'st-v003', src:'https://picsum.photos/id/1050/1600/1066', title:'Pattern vector', tags:['vector','pattern'], mime:'image/svg+xml', has_people:false, dominant_color:'#a1b2c3', width:1600, height:1066, alt:'Vector pattern' },
  { id:'st-vid001', src:'https://picsum.photos/id/1062/1600/1066', title:'Cinematic waves', tags:['video','ocean'], mime:'video/mp4', has_people:false, dominant_color:'#264653', width:1600, height:1066, alt:'Video: waves' },
  { id:'st-vid002', src:'https://picsum.photos/id/1063/1600/1066', title:'City timelapse', tags:['video','city'], mime:'video/mp4', has_people:false, dominant_color:'#2a2a2a', width:1600, height:1066, alt:'Video: city' },
  { id:'st-vid003', src:'https://picsum.photos/id/1064/1600/1066', title:'Forest b-roll', tags:['video','forest'], mime:'video/mp4', has_people:false, dominant_color:'#2e5b3c', width:1600, height:1066, alt:'Video: forest' },
];