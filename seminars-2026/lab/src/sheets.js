/* ============================================================
   The teacher's problem sets (exercises and projects/Exercise N Problem Set.pdf)
   linked from every session: header, problem-set panel, definition cards,
   motivating task and reading list. Instances drawn on the sheets are presets
   with the sheet's own layout, so paper work can be checked in the lab.
   Transcribed from the PDFs (W 24/25); the presets cite problem numbers only.
   ============================================================ */
const SHEET_BASE = 'https://github.com/JanPastorek/1-AIN-413-22-Graphs/blob/main/exercises%20and%20projects/';
const SHEET_FILE = n => `Exercise ${n} Problem Set.pdf`;
const sheetURL = n => SHEET_BASE + encodeURIComponent(SHEET_FILE(n));
const sheetLink = (n, text) => `<a href="${sheetURL(n)}" target="_blank" rel="noopener">${text || `Problem set ${n}`}</a>`;
const pagesText = p => p ? (String(p).includes('–') ? `pp. ${p}` : `p. ${p}`) : '';

const SHEET_PRESETS = {
  ps2_2a: { name: "PS 2 · P2 graph 1", group: 'Problem set 2', sheet: 2, layout: 'pos', text: "1 0\n0 4\n4 3\n3 2\n2 1\n1 6\n0 5\n4 9\n3 8\n2 7\n6 8\n6 9\n7 5\n7 9\n5 8", pos: {"1":[399,78],"6":[399,178],"2":[210,217],"7":[304,248],"5":[496,248],"0":[590,217],"8":[341,361],"9":[459,358],"3":[283,439],"4":[517,442]} },
  ps2_2b: { name: "PS 2 · P2 graph 2", group: 'Problem set 2', sheet: 2, layout: 'pos', text: "2 1\n2 3\n2 7\n1 6\n1 0\n6 9\n6 8\n7 9\n7 5\n9 4\n3 4\n3 8\n0 4\n0 5\n8 5", pos: {"2":[295,78],"1":[503,78],"6":[292,198],"7":[508,196],"3":[191,259],"9":[401,259],"0":[609,259],"4":[401,385],"8":[295,439],"5":[503,442]} },
  ps2_2c: { name: "PS 2 · P2 graph 3", group: 'Problem set 2', sheet: 2, layout: 'pos', text: "3 2\n2 1\n1 0\n0 5\n5 8\n8 6\n6 9\n9 4\n4 3\n2 7\n3 8\n4 0\n1 6\n7 9\n7 5", pos: {"3":[304,100],"2":[427,78],"1":[535,141],"4":[222,196],"7":[395,259],"0":[578,259],"9":[222,321],"5":[535,379],"6":[301,418],"8":[427,442]} },
  ps3_2a: { name: "PS 3 · P2(a) the three graphs of PS 2", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "1 0\n0 4\n4 3\n3 2\n2 1\n1 6\n0 5\n4 9\n3 8\n2 7\n6 8\n6 9\n7 5\n7 9\n5 8\n---\n2 1\n2 3\n2 7\n1 6\n1 0\n6 9\n6 8\n7 9\n7 5\n9 4\n3 4\n3 8\n0 4\n0 5\n8 5\n---\n3 2\n2 1\n1 0\n0 5\n5 8\n8 6\n6 9\n9 4\n4 3\n2 7\n3 8\n4 0\n1 6\n7 9\n7 5", pos: {"0|1":[172,194],"0|6":[172,230],"0|2":[103,244],"0|7":[137,256],"0|5":[207,256],"0|0":[241,244],"0|8":[151,297],"0|9":[193,296],"0|3":[130,325],"0|4":[214,326],"1|2":[365,200],"1|1":[434,200],"1|6":[364,240],"1|7":[436,239],"1|3":[331,260],"1|9":[400,260],"1|0":[469,260],"1|4":[400,301],"1|8":[365,319],"1|5":[434,320],"2|3":[591,198],"2|2":[638,190],"2|1":[680,214],"2|4":[559,235],"2|7":[626,260],"2|0":[697,260],"2|9":[559,284],"2|5":[680,306],"2|6":[590,321],"2|8":[638,330]} },
  ps3_2b: { name: "PS 3 · P2(b) pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a d\nc d\nd i\nd f\nf g\ng b\ng h\n---\nu w\nv w\nw x\nw z\ny z\nz s", pos: {"0|a":[165,197],"0|b":[293,197],"0|c":[103,259],"0|d":[165,259],"0|f":[231,259],"0|g":[293,257],"0|h":[355,257],"0|i":[165,323],"1|u":[573,139],"1|v":[448,257],"1|w":[569,257],"1|x":[697,257],"1|y":[445,381],"1|z":[569,381],"1|s":[690,381]} },
  ps3_2c: { name: "PS 3 · P2(c) pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\nb g\nc h\nd f\nf g\ng h\nh i\n---\nu v\nv t\nu x\nw x\nx z\ny z\nz s", pos: {"0|a":[166,228],"0|b":[232,230],"0|c":[293,228],"0|d":[103,292],"0|f":[166,292],"0|g":[232,292],"0|h":[293,290],"0|i":[355,292],"1|u":[571,136],"1|v":[697,136],"1|w":[448,258],"1|x":[571,258],"1|t":[697,258],"1|y":[445,384],"1|z":[571,384],"1|s":[697,384]} },
  ps3_2d: { name: "PS 3 · P2(d) pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\na c\nb c\nb d\nc d\n---\nu w\nu x\nv w\nv x\nw x", pos: {"0|a":[103,137],"0|b":[355,137],"0|c":[103,383],"0|d":[355,383],"1|u":[445,139],"1|v":[697,139],"1|w":[445,381],"1|x":[697,381]} },
  ps3_2e: { name: "PS 3 · P2(e) pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\na c\nb f\nb d\nf c\nf d\nc d\n---\nv u\nv w\nu x\nu y\nw x\nw y\nx y", pos: {"0|a":[106,137],"0|b":[355,137],"0|f":[231,258],"0|c":[103,379],"0|d":[355,383],"1|v":[576,88],"1|u":[450,194],"1|w":[692,197],"1|x":[450,429],"1|y":[692,432]} },
  ps3_2f: { name: "PS 3 · P2(f) G, H, J", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\nd c\na d\nb c\nf g\ni h\nf i\ng h\na f\nb g\nd i\nc h\n---\na1 b1\nb1 c1\nc1 d1\nd1 f1\nf1 g1\ng1 h1\nh1 i1\ni1 a1\na1 g1\nb1 f1\ni1 c1\nh1 d1\n---\na2 b2\nb2 c2\nc2 d2\nd2 f2\nf2 g2\ng2 h2\nh2 i2\ni2 a2\na2 f2\nb2 g2\nc2 h2\nd2 i2", pos: {"0|a":[138,187],"0|b":[241,189],"0|d":[105,230],"0|c":[206,232],"0|f":[138,290],"0|g":[241,292],"0|i":[103,333],"0|h":[206,333],"1|a1":[373,189],"1|b1":[428,193],"1|i1":[331,232],"1|c1":[469,233],"1|h1":[331,288],"1|d1":[469,292],"1|g1":[372,329],"1|f1":[428,331],"2|a2":[599,190],"2|b2":[655,192],"2|i2":[559,230],"2|c2":[697,232],"2|h2":[559,288],"2|d2":[697,290],"2|g2":[599,328],"2|f2":[655,330]} },
  ps3_2g: { name: "PS 3 · P2(g) G, H, J, K", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\nb c\nc d\nd f\nf g\ng h\nh a\na f\na d\nh c\nh d\ng b\ng c\nf b\n---\nh1 a1\na1 b1\nb1 c1\nc1 d1\nd1 f1\nf1 g1\ng1 h1\nh1 b1\na1 g1\na1 c1\nh1 f1\nb1 d1\ng1 d1\nf1 c1\n---\na2 h2\na2 b2\nb2 c2\nc2 d2\nd2 f2\nf2 g2\ng2 h2\nh2 b2\nh2 c2\na2 f2\na2 d2\ng2 b2\ng2 d2\nf2 c2\n---\na3 h3\na3 b3\na3 g3\na3 c3\nh3 g3\nh3 f3\nh3 d3\nb3 c3\nb3 f3\nb3 d3\ng3 f3\ng3 d3\nc3 f3\nc3 d3", pos: {"0|a":[229,88],"0|h":[170,115],"0|b":[288,117],"0|g":[155,178],"0|c":[303,181],"0|f":[196,230],"0|d":[261,230],"1|a1":[571,88],"1|h1":[513,116],"1|b1":[629,117],"1|g1":[498,178],"1|c1":[644,180],"1|f1":[538,229],"1|d1":[603,230],"2|a2":[230,290],"2|h2":[172,317],"2|b2":[287,319],"2|g2":[157,380],"2|c2":[301,383],"2|f2":[197,432],"2|d2":[262,432],"3|a3":[571,290],"3|h3":[513,319],"3|b3":[629,318],"3|g3":[499,382],"3|c3":[643,383],"3|f3":[539,432],"3|d3":[602,432]} },
  ps3_2h: { name: "PS 3 · P2(h) G, H, J, K, M", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a g\na f\na d\nb g\nb f\nb d\nc g\nc f\nc d\n---\na1 b1\nb1 c1\na1 g1\nb1 f1\nc1 d1\ng1 f1\nf1 d1\n---\na2 b2\nb2 c2\nc2 d2\nd2 f2\nf2 g2\ng2 a2\na2 d2\nb2 f2\n---\na3 f3\nb3 d3\na3 d3\na3 c3\nb3 g3\nb3 f3\ng3 d3\nc3 f3\n---\na4 f4\nb4 d4\ng4 c4\na4 d4\na4 c4\nb4 f4\nb4 g4\ng4 d4\nc4 f4", pos: {"0|a":[103,124],"0|b":[172,125],"0|c":[241,127],"0|g":[103,192],"0|f":[172,193],"0|d":[240,194],"1|a1":[331,124],"1|b1":[401,125],"1|c1":[469,126],"1|g1":[331,192],"1|f1":[400,194],"1|d1":[468,194],"2|a2":[594,99],"2|b2":[662,100],"2|g2":[559,158],"2|c2":[697,159],"2|f2":[593,218],"2|d2":[662,219],"3|a3":[138,301],"3|b3":[206,302],"3|g3":[103,361],"3|c3":[241,361],"3|f3":[138,420],"3|d3":[206,421],"4|a4":[366,301],"4|b4":[434,302],"4|g4":[331,361],"4|c4":[469,361],"4|f4":[365,420],"4|d4":[434,421]} },
  ps3_2i: { name: "PS 3 · P2(i) G, H, J, K", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b\nb c\nc d\nd f\nf g\ng h\nh i\ni a\na g\nb f\ni d\nh c\n---\na1 b1\nb1 c1\nc1 d1\nd1 f1\nf1 g1\ng1 h1\nh1 i1\ni1 a1\na1 g1\nb1 f1\ni1 c1\nh1 d1\n---\na2 b2\nb2 c2\nc2 d2\nd2 f2\nf2 g2\ng2 h2\nh2 i2\ni2 a2\na2 c2\nb2 g2\ni2 d2\nh2 f2\n---\na3 b3\nb3 c3\nc3 d3\nd3 f3\nf3 g3\ng3 h3\nh3 i3\ni3 a3\na3 h3\nb3 i3\nc3 f3\nd3 g3", pos: {"0|a":[201,88],"0|b":[258,90],"0|c":[301,131],"0|d":[299,191],"0|f":[257,230],"0|g":[199,230],"0|h":[157,189],"0|i":[158,131],"1|a1":[544,88],"1|b1":[601,89],"1|c1":[643,130],"1|d1":[641,190],"1|f1":[600,230],"1|g1":[541,230],"1|h1":[499,189],"1|i1":[500,130],"2|a2":[199,290],"2|b2":[256,293],"2|c2":[299,332],"2|d2":[299,390],"2|f2":[257,432],"2|g2":[199,430],"2|h2":[159,391],"2|i2":[159,333],"3|a3":[542,290],"3|b3":[598,292],"3|c3":[641,331],"3|d3":[641,391],"3|f3":[599,432],"3|g3":[542,430],"3|h3":[502,391],"3|i3":[501,332]} },
  ps3_2j: { name: "PS 3 · P2(j) directed pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "directed\na d\nc d\ni d\nd f\nb f\nf g\n---\nw u\nv w\nx w\nz w\ny z\ns z", pos: {"0|a":[186,176],"0|b":[273,177],"0|c":[103,259],"0|d":[186,257],"0|f":[273,257],"0|g":[355,254],"0|i":[186,344],"1|u":[570,135],"1|v":[446,256],"1|w":[570,256],"1|x":[697,255],"1|y":[445,385],"1|z":[570,383],"1|s":[694,382]} },
  ps3_2k: { name: "PS 3 · P2(k) directed pair", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "directed\na b\nb d\nd c\nc a\nb c\na d\n---\nu v\nv x\nx w\nw u\nv w\nx u", pos: {"0|a":[103,138],"0|b":[355,135],"0|c":[103,385],"0|d":[355,381],"1|u":[446,138],"1|v":[697,136],"1|w":[445,384],"1|x":[697,382]} },
  ps3_2l: { name: "PS 3 · P2(l) directed G, H, K", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "directed\na b\na f\nb f\nb d\nd c\nc a\n---\na1 b1\nf1 a1\nf1 b1\nb1 d1\nd1 c1\nc1 a1\n---\nb2 a2\na2 f2\nb2 f2\na2 c2\nc2 d2\nd2 b2", pos: {"0|a":[103,194],"0|b":[241,193],"0|f":[172,259],"0|c":[103,327],"0|d":[240,326],"1|a1":[332,194],"1|b1":[469,193],"1|f1":[399,258],"1|c1":[331,327],"1|d1":[468,326],"2|a2":[559,194],"2|b2":[697,193],"2|f2":[627,259],"2|c2":[559,327],"2|d2":[697,326]} },
  ps3_4b1: { name: "PS 3 · P4(b) weighted graph 1 (also PS 5 P1(a))", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a d 4\na f 3\na g 9\nb d 7\nb f 1\nb g 6\nc d 5\nc f 5\nc g 2", pos: {"a":[83,99],"b":[396,100],"c":[717,102],"d":[78,421],"f":[401,417],"g":[722,417]} },
  ps3_4b2: { name: "PS 3 · P4(b) weighted graph 2 (also PS 5 P1(a))", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b 5\na c 2\nb d 3\nc d 2\na f 7\nc h 9\nb g 2\nd i 3\nf g 2\nf h 8\ng i 4\nh i 1", pos: {"a":[326,78],"b":[573,82],"c":[227,182],"d":[482,186],"f":[318,334],"g":[564,338],"h":[227,442],"i":[487,433]} },
  ps3_4b3: { name: "PS 3 · P4(b) weighted graph 3", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b 6\nb c 8\nd a 12\na f 8\nd f 5\nd i 5\ni f 4\nf b 4\nb g 3\nf g 2\nf j 4\ni j 2\nj g 2\ng c 6\nc h 2\ng h 5\ng k 3\nk h 6\nj k 10", pos: {"a":[185,170],"b":[400,170],"c":[610,172],"d":[78,260],"f":[301,262],"g":[524,260],"h":[722,262],"i":[181,346],"j":[402,348],"k":[625,350]} },
  ps3_4b4: { name: "PS 3 · P4(b) G (arrows dropped for the MST)", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "a b 8\nc b 2\nc d 6\nf a 2\nb f 8\nb g 7\ng c 5\nh c 4\nd h 3\nf g 3\nh g 1\ni f 7\nf j 5\ng j 5\nk g 7\nk h 3\nh l 9\nj i 4\nj k 1\nl k 9", pos: {"a":[78,82],"b":[292,82],"c":[505,82],"d":[719,82],"f":[185,255],"g":[399,255],"h":[615,255],"i":[78,438],"j":[292,438],"k":[505,438],"l":[722,438]} },
  ps3_4b5: { name: "PS 3 · P4(b) H (arrows dropped for the MST)", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "b a 3\nc a 5\na d 7\nb c 3\nd c 9\nb g 4\nh c 4\nc f 5\nf b 4\nc g 7\ng d 8\nd i 6\ng f 2\ng h 4\ni h 8\nf j 1\nj g 7\nh j 5\nj i 3", pos: {"a":[336,78],"b":[194,189],"c":[336,189],"d":[479,185],"f":[195,329],"g":[336,329],"h":[480,329],"i":[606,330],"j":[336,442]} },
  ps3_4b4d: { name: "PS 3 · P4(b) G as drawn, with arrows", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "directed\na b 8\nc b 2\nc d 6\nf a 2\nb f 8\nb g 7\ng c 5\nh c 4\nd h 3\nf g 3\nh g 1\ni f 7\nf j 5\ng j 5\nk g 7\nk h 3\nh l 9\nj i 4\nj k 1\nl k 9", pos: {"a":[78,82],"b":[292,82],"c":[505,82],"d":[719,82],"f":[185,255],"g":[399,255],"h":[615,255],"i":[78,438],"j":[292,438],"k":[505,438],"l":[722,438]} },
  ps3_4b5d: { name: "PS 3 · P4(b) H as drawn, with arrows", group: 'Problem set 3', sheet: 3, layout: 'pos', text: "directed\nb a 3\nc a 5\na d 7\nb c 3\nd c 9\nb g 4\nh c 4\nc f 5\nf b 4\nc g 7\ng d 8\nd i 6\ng f 2\ng h 4\ni h 8\nf j 1\nj g 7\nh j 5\nj i 3", pos: {"a":[336,78],"b":[194,189],"c":[336,189],"d":[479,185],"f":[195,329],"g":[336,329],"h":[480,329],"i":[606,330],"j":[336,442]} },
  ps4_4a: { name: "PS 4 · P4 graph 1 (also PS 6 P1)", group: 'Problem set 4', sheet: 4, layout: 'pos', text: "7 6 2\n6 2 5\n6 3 9\n3 2 4\n7 5 1\n5 3 9\n7 4 1\n3 1 2\n1 4 9\n1 0 6\n4 0 8", pos: {"7":[157,128],"6":[444,87],"2":[643,78],"3":[433,174],"5":[217,206],"4":[557,360],"1":[424,372],"0":[568,442]} },
  ps4_4b: { name: "PS 4 · P4 graph 2 (also PS 6 P1)", group: 'Problem set 4', sheet: 4, layout: 'pos', text: "4 0 9\n0 1 3\n4 1 1\n4 7 8\n7 5 7\n7 6 6\n5 3 6\n1 3 9\n6 3 3\n6 2 7\n2 3 1", pos: {"0":[595,78],"4":[409,104],"7":[255,199],"1":[643,231],"5":[360,269],"3":[504,321],"6":[201,338],"2":[157,442]} },
  ps5_1b1: { name: "PS 5 · P1(b) left graph", group: 'Problem set 5', sheet: 5, layout: 'pos', text: "1 3\n1 4\n1 5\n1 6\n3 2\n4 2\n3 10\n3 8\n4 11\n4 9\n10 11\n10 5\n11 6\n2 7\n7 5\n7 6\n7 8\n7 9\n8 11\n9 10", pos: {"1":[400,78],"3":[209,217],"4":[591,217],"10":[282,442],"11":[517,442],"2":[400,180],"5":[305,249],"6":[495,249],"7":[400,279],"8":[341,360],"9":[460,360]} },
  ps5_1b2: { name: "PS 5 · P1(b) right graph", group: 'Problem set 5', sheet: 5, layout: 'pos', text: "1 2\n1 3\n1 6\n4 2\n4 6\n4 7\n5 3\n5 6\n5 8\n2 8\n2 9\n3 7\n3 9\n7 8\n7 10\n8 11\n6 10\n6 11\n9 10\n9 11", pos: {"1":[400,78],"2":[341,198],"3":[459,198],"4":[208,217],"5":[592,217],"6":[400,279],"7":[305,310],"8":[496,310],"9":[400,379],"10":[282,442],"11":[519,442]} },
  ps5_2g: { name: "PS 5 · P2(a) graph G", group: 'Problem set 5', sheet: 5, layout: 'pos', text: "a f\na b\na h\nf e\nb c\ne d\nc d\nf g\nh g\nh i\nb i\nh m\ng l\ni j\nm l\nm j\nl e\nl k\nj k\nj c\nk d", pos: {"a":[401,78],"b":[558,171],"c":[558,350],"d":[401,442],"e":[242,350],"f":[242,169],"h":[401,168],"g":[322,213],"i":[479,212],"m":[401,256],"l":[322,304],"j":[477,304],"k":[401,348]} },
  ps5_2h: { name: "PS 5 · P2(a) graph H", group: 'Problem set 5', sheet: 5, layout: 'pos', text: "a f\na b\na h\nf e\nb c\ne d\nc d\nf g\nh g\nh b\nh i\nh l\ng k\nl k\nl j\nk j\ne k\ni j\ni c\nj d", pos: {"a":[402,78],"b":[556,171],"c":[556,351],"d":[402,442],"e":[244,353],"f":[244,169],"h":[402,169],"g":[320,227],"i":[483,226],"l":[400,257],"k":[349,323],"j":[453,323]} },
  ps7_n1311: { name: "PS 7 · network of Grimaldi Fig. 13.11 (cuts C₁, C₂)", group: 'Problem set 7', sheet: 7, layout: 'pos', text: "directed\na b 5\na g 7\ng b 5\nb d 4\nb h 6\ng h 5\nh d 2\nd z 5\nh z 6", pos: {"a":[78,260],"b":[264,126],"d":[537,126],"g":[264,394],"h":[535,394],"z":[722,260]} },
  ps7_st: { name: "PS 7 · network S → T", group: 'Problem set 7', sheet: 7, layout: 'pos', text: "directed\nS A 4\nS C 3\nA B 4\nB C 3\nB T 2\nC D 6\nD T 6", pos: {"S":[78,259],"A":[257,154],"B":[543,154],"C":[257,366],"D":[543,366],"T":[722,259]} },
  ps7_ni: { name: "PS 7 · network (i), a → z", group: 'Problem set 7', sheet: 7, layout: 'pos', text: "directed\na b 4\nb j 6\nj k 5\nk d 4\na d 3\nd z 5\na g 3\ng h 6\nh d 4\nh m 4\nm n 8\nn z 7", pos: {"a":[78,260],"b":[295,145],"j":[443,145],"k":[589,145],"d":[401,260],"z":[722,260],"g":[184,375],"h":[420,375],"m":[566,375],"n":[713,375]} },
  ps7_n1323: { name: "PS 7 · Grimaldi Fig. 13.23 (lines without arrows as two opposite arcs)", group: 'Problem set 7', sheet: 7, layout: 'pos', text: "directed\na b 7\na g 6\na j 4\nb d 4\nd f 6\nh d 5\ng h 4\ng j 5\nh k 5\nh i 4\ni f 5\nf z 5\ni z 7\nj k 6\nk m 4\nm z 5\nb g 5\ng b 5\nb h 4\nh b 4\nh f 4\nf h 4\ng k 4\nk g 4\nk i 4\ni k 4\ni m 5\nm i 5", pos: {"a":[78,260],"b":[223,136],"d":[401,136],"f":[579,136],"g":[223,260],"h":[401,260],"i":[579,260],"z":[722,260],"j":[223,384],"k":[401,384],"m":[579,384]} },
  ps8_19g: { name: "PS 8 · P1 graph G", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "a b\nb c\na f\nf g\ng h\na g\nb f\nb h\nc g\na d\nc d\nb d\nd g", pos: {"a":[78,98],"b":[400,106],"c":[718,107],"d":[400,248],"f":[78,417],"g":[400,422],"h":[722,422]} },
  ps8_19h: { name: "PS 8 · P1 graph H", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "a g\na h\na j\nb g\nb j\nc g\nc i\nc l\nd i\nd j\nf g\nf h\nf l", pos: {"a":[78,178],"b":[237,179],"c":[397,181],"d":[559,182],"f":[722,182],"g":[78,336],"h":[237,337],"i":[397,339],"j":[559,340],"l":[722,342]} },
  ps8_969a: { name: "PS 8 · P2.3 marriage problem (a)", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "Jian Sam\nJian Tom\nLouise Tom\nMasako Sam\nMasako Wes\nTammy Robert\nTammy Will\nTanya Wes\nTanya Will\nZena Mike\nZena Sam", pos: {"Jian":[207,78],"Louise":[207,144],"Masako":[211,224],"Tammy":[207,286],"Tanya":[209,365],"Zena":[207,436],"Mike":[591,86],"Robert":[591,156],"Sam":[591,225],"Tom":[593,309],"Wes":[593,367],"Will":[591,442]} },
  ps8_969b: { name: "PS 8 · P2.3 marriage problem (b)", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "Jian Mike\nJian Tom\nLouise Tom\nLouise Will\nMasako Wes\nTammy Mike\nTammy Will\nTanya Robert\nTanya Wes\nZena Mike\nZena Sam\nZena Will", pos: {"Jian":[208,78],"Louise":[208,146],"Masako":[210,225],"Tammy":[210,287],"Tanya":[208,367],"Zena":[208,438],"Mike":[592,84],"Robert":[592,156],"Sam":[592,228],"Tom":[592,306],"Wes":[592,369],"Will":[592,442]} },
  ps8_311a: { name: "PS 8 · P2.4 graph 1", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "x1 y3\nx2 y3\nx3 y1\nx3 y2\nx3 y3\nx3 y5\nx4 y2\nx4 y3\nx4 y4\nx4 y5", pos: {"x1":[156,100],"x2":[319,100],"x3":[480,100],"x4":[641,100],"y1":[78,420],"y2":[238,420],"y3":[399,420],"y4":[561,420],"y5":[722,420]} },
  ps8_311b: { name: "PS 8 · P2.4 graph 2", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "x1 y2\nx1 y3\nx2 y3\nx3 y2\nx4 y1\nx4 y3\nx4 y4\nx4 y5\nx5 y2\nx5 y3", pos: {"x1":[78,100],"x2":[239,100],"x3":[399,100],"x4":[560,100],"x5":[722,100],"y1":[78,420],"y2":[239,420],"y3":[399,420],"y4":[560,420],"y5":[722,420]} },
  ps8_311c: { name: "PS 8 · P2.4 graph 3", group: 'Problem set 8', sheet: 8, layout: 'pos', text: "x1 y2\nx1 y4\nx2 y1\nx2 y2\nx2 y3\nx2 y4\nx3 y2\nx3 y4\nx4 y1\nx4 y2\nx4 y4\nx4 y5\nx5 y2\nx5 y4", pos: {"x1":[78,100],"x2":[240,100],"x3":[401,100],"x4":[560,100],"x5":[722,100],"y1":[78,420],"y2":[240,420],"y3":[401,420],"y4":[560,420],"y5":[722,420]} },
  ps9_13: { name: "PS 9 · P1.3 is this graph planar?", group: 'Problem set 9', sheet: 9, layout: 'pos', text: "A E\nA F\nA G\nE C\nE D\nB F\nB C\nC G\nD F\nD G", pos: {"A":[248,78],"E":[552,78],"B":[248,203],"F":[552,261],"C":[248,325],"D":[248,442],"G":[552,442]} },
  ps9_614: { name: "PS 9 · P2 (West 6.1.4) graph for its duals", group: 'Problem set 9', sheet: 9, layout: 'pos', text: "3 4\n4 1\n4 6\n1 6\n1 2\n2 7\n6 7\n5 2", pos: {"3":[78,265],"4":[244,265],"1":[400,99],"2":[722,99],"5":[559,265],"6":[400,421],"7":[722,421]} },
  ps9_3: { name: "PS 9 · P3 graph for the chromatic number", group: 'Problem set 9', sheet: 9, layout: 'pos', text: "1 3\n1 4\n1 5\n1 6\n3 2\n4 2\n3 10\n3 8\n4 11\n4 9\n10 11\n10 5\n11 6\n2 7\n7 5\n7 6\n7 8\n7 9\n8 11\n9 10", pos: {"1":[400,78],"2":[400,178],"3":[209,216],"4":[591,216],"5":[305,248],"6":[496,248],"7":[400,280],"8":[341,360],"9":[459,360],"10":[281,442],"11":[519,442]} },
};
(() => {
  const cyc = n => Array.from({ length: n }, (_, i) => `v${i + 1} v${(i + 1) % n + 1}`).join('\n');
  const path = n => Array.from({ length: n - 1 }, (_, i) => `v${i + 1} v${i + 2}`).join('\n');
  for (const n of [6, 7, 8, 9]) SHEET_PRESETS['ps11_c' + n] = { name: `PS 11 · P1 cycle C${'₀₁₂₃₄₅₆₇₈₉'[n]}`, group: 'Problem set 11', sheet: 11, layout: 'circle', text: cyc(n) };
  for (const n of [6, 7, 8, 9]) SHEET_PRESETS['ps11_p' + n] = { name: `PS 11 · P1 path P${'₀₁₂₃₄₅₆₇₈₉'[n]}`, group: 'Problem set 11', sheet: 11, text: path(n) };
})();
Object.assign(PRESETS, SHEET_PRESETS);

const MARRIAGE_PS8 = 'V: A B C D E\nW: B C D A E\nX: C D A B E\nY: D A B C E\nZ: A B C D E\n---\nA: W X Y Z V\nB: X Y Z V W\nC: Y Z V W X\nD: Z V W X Y\nE: V W X Y Z';
const swapSides = t => { const [a, b] = t.split('\n---\n'); return b + '\n---\n' + a; };
const sheetRun = (label, setup) => [label, setup];

/* SHEETS[module] = [{ ps, items: [{ p, title, page, note?, runs?: [[label, setup]] }] }] */
const SHEETS = {
  traverse: [
    { ps: 1, items: [{ p: 'P2', title: 'Cycle detection in linear time', page: 2, note: 'A digraph has a cycle exactly when DFS meets a back edge. Watch for the back-edge colour.', runs: [sheetRun('DFS on the digraph G of PS 3 P4(b)', { preset: 'ps3_4b4d', algo: 'dfs', params: { source: 'a' } })] }] },
    { ps: 2, items: [
      { p: 'P2(a)', title: 'Diameter, eccentricities, radius, central vertex', page: 1, note: 'The last BFS layer is the eccentricity of the start vertex. Run BFS from each vertex to check your distance matrix.', runs: [sheetRun('Graph 1', { preset: 'ps2_2a', algo: 'bfs', params: { source: '0' } }), sheetRun('Graph 2', { preset: 'ps2_2b', algo: 'bfs', params: { source: '0' } }), sheetRun('Graph 3', { preset: 'ps2_2c', algo: 'bfs', params: { source: '0' } })] },
      { p: 'P4', title: 'Diameter and radius of hypercubes, cycles, paths, complete graphs', page: 2, runs: [sheetRun('Q₃', { preset: 'cube', algo: 'bfs', params: { source: '000' } }), sheetRun('K₅', { preset: 'k5', algo: 'bfs', params: { source: '1' } }), sheetRun('C₈', { preset: 'ps11_c8', algo: 'bfs', params: { source: 'v1' } }), sheetRun('P₇', { preset: 'ps11_p7', algo: 'bfs', params: { source: 'v1' } })] }] },
    { ps: 3, items: [
      { p: 'P1', title: 'Bipartite graphs (Stanoyevitch 8.1 ex. 13–14)', page: 1 },
      { p: 'P2', title: 'Which of the drawn graphs are bipartite?', page: '1–4', note: 'BFS from a vertex of one drawing ends with a 2-colouring or an odd cycle for that drawing.', runs: [sheetRun('(d)', { preset: 'ps3_2d', algo: 'bfs', params: { source: 'a' } }), sheetRun('(e)', { preset: 'ps3_2e', algo: 'bfs', params: { source: 'a' } }), sheetRun('(h)', { preset: 'ps3_2h', algo: 'bfs', params: { source: 'a' } }), sheetRun('(i)', { preset: 'ps3_2i', algo: 'bfs', params: { source: 'a' } })] }] },
  ],
  degrees: [
    { ps: 1, items: [{ p: 'P1', title: 'Odd number of vertices, every degree odd?', page: 2 }] },
    { ps: 2, items: [
      { p: 'P2(b–c)', title: 'Is C a vertex cut? Is C an edge cut?', page: 1, note: 'The lab marks every cut vertex and bridge. To test a set C, delete its vertices or edges from the edge list and run again.', runs: [sheetRun('Graph 1', { preset: 'ps2_2a', algo: 'bridges', params: { source: '0' } }), sheetRun('Graph 2', { preset: 'ps2_2b', algo: 'bridges', params: { source: '0' } }), sheetRun('Graph 3', { preset: 'ps2_2c', algo: 'bridges', params: { source: '0' } })] },
      { p: 'P3', title: 'Are these sequences graphical? Construct a realisation.', page: 2, note: 'Decide each sequence on paper first, then compare with Havel–Hakimi and the Erdős–Gallai table.', runs: ['2 2 2 1 1', '2 2', '2 2 2 2', '3 3 5 1 7 9 1', '3 3 3 3 3 3 3 3', '6 5 5 4 3 3 3 2 2', '3 3 2 2 1 1', '7 6 4 3 3 2', '3 3 1 1', '5 4 3 3 2 2 2 1 1 1'].map((q, i) => sheetRun(`${i + 1}`, { algo: 'hh', params: { seq: q } })) }] },
    { ps: 3, items: [{ p: 'P3(c)', title: 'Degree sequences of trees: Σ dᵢ = 2n − 2 (Stanoyevitch 8.3 ex. 41)', page: 4, runs: [sheetRun('Realise 3 2 2 1 1 1', { algo: 'hh', params: { seq: '3 2 2 1 1 1' } })] }] },
  ],
  iso: [
    { ps: 3, items: [
      { p: 'P2(x)', title: 'Isomorphism is an equivalence relation', page: 1 },
      { p: 'P2(a–l)', title: 'Which of these graphs are isomorphic?', page: '1–4', note: 'Colour refinement can prove two graphs different (the histograms differ), never the same. When it stops undecided, find a bijection and check it in <b>Check a certificate</b> mode (two graphs at a time). In (j)–(l) the arcs keep their direction.', runs: 'abcdefghijkl'.split('').map(x => sheetRun(`(${x})`, { preset: 'ps3_2' + x, algo: 'wl' })) }] },
  ],
  mst: [
    { ps: 3, items: [
      { p: 'P3', title: 'Trees: cut vertices, bipartite, degree sequences', page: 4 },
      { p: 'P4(a)', title: 'Every connected graph has a spanning tree', page: 4 },
      { p: 'P4(b)', title: 'Kruskal and Prim on four graphs, several starting vertices', page: '4–5', note: 'Switch between Kruskal and Prim and change Start. Arrows in the last two drawings are ignored for the spanning tree.', runs: [sheetRun('Graph 1', { preset: 'ps3_4b1', algo: 'kruskal' }), sheetRun('Graph 2', { preset: 'ps3_4b2', algo: 'kruskal' }), sheetRun('Graph 3', { preset: 'ps3_4b3', algo: 'kruskal' }), sheetRun('G', { preset: 'ps3_4b4', algo: 'prim', params: { source: 'a' } }), sheetRun('H', { preset: 'ps3_4b5', algo: 'prim', params: { source: 'a' } })] },
      { p: 'P4(c)', title: 'Correctness of Prim and Kruskal (Stanoyevitch 9.2 ex. 26–27)', page: 5 }] },
    { ps: 4, items: [
      { p: 'P1', title: 'Huffman coding', page: 1, note: 'Huffman’s algorithm builds a binary tree greedily, like Kruskal merges components; this lab has no Huffman view.' },
      { p: 'P2', title: 'Binary trees of algebraic expressions', page: '1–2' }] },
  ],
  sp: [
    { ps: 4, items: [{ p: 'P4', title: 'Dijkstra from various vertices', page: '2–3', note: 'Change Source and compare the distance table with yours.', runs: [sheetRun('Graph 1', { preset: 'ps4_4a', algo: 'dijkstra', params: { source: '0' } }), sheetRun('Graph 2', { preset: 'ps4_4b', algo: 'dijkstra', params: { source: '0' } })] }] },
    { ps: 6, items: [
      { p: 'P1', title: 'Simulate each shortest-path algorithm on the graphs of PS 4', page: '2–3', note: 'The lab has Dijkstra, Bellman–Ford and Floyd–Warshall; Johnson’s reweighting you do by hand, using Bellman–Ford from an added vertex.', runs: [sheetRun('Bellman–Ford, graph 1', { preset: 'ps4_4a', algo: 'bf', params: { source: '0' } }), sheetRun('Floyd–Warshall, graph 1', { preset: 'ps4_4a', algo: 'fw' }), sheetRun('Bellman–Ford, graph 2', { preset: 'ps4_4b', algo: 'bf', params: { source: '0' } }), sheetRun('Floyd–Warshall, graph 2', { preset: 'ps4_4b', algo: 'fw' })] },
      { p: 'P2', title: 'Choice of algorithms for ten kinds of graphs', page: '3–5', note: 'The lab’s <i>Choose</i> task above asks the same question for five scenarios.' }] },
    { ps: 3, items: [{ p: 'P4(b)+', title: 'Extra practice: the digraphs G and H of PS 3 P4(b) with their arrows', page: 5, runs: [sheetRun('Dijkstra on G from a', { preset: 'ps3_4b4d', algo: 'dijkstra', params: { source: 'a' } }), sheetRun('Dijkstra on H from a', { preset: 'ps3_4b5d', algo: 'dijkstra', params: { source: 'a' } })] }] },
  ],
  route: [
    { ps: 5, items: [
      { p: 'P1(a)', title: 'Eulerian? Find an Euler tour or trail', page: 1, note: 'These are the two weighted graphs of PS 3 P4(b).', runs: [sheetRun('Graph 1', { preset: 'ps3_4b1', algo: 'euler', params: { goal: 'closed' } }), sheetRun('Graph 2', { preset: 'ps3_4b2', algo: 'euler', params: { goal: 'closed' } })] },
      { p: 'P1(b)', title: 'Girth and circumference', page: 1, note: 'A Hamilton cycle, if one exists, shows the circumference is n.', runs: [sheetRun('Left graph', { preset: 'ps5_1b1', algo: 'ham', params: { source: '1' } }), sheetRun('Right graph', { preset: 'ps5_1b2', algo: 'ham', params: { source: '1' } })] },
      { p: 'P1.1–1.7', title: 'Euler trails in Kₙ and Kₘ,ₙ, trail decompositions, edge colourings', page: 2 },
      { p: 'P1.8', title: 'Fleury’s algorithm: why it finds an Euler tour or trail, and its running time', page: 2, note: 'Run it in <b>Predict</b> mode: before every choice the lab asks which edge Fleury may take and marks the bridges of the unused edges. Compare the number of steps with Hierholzer.', runs: [sheetRun('Two clusters joined by one link', { preset: 'barbell', algo: 'fleury', params: { source: 'c' } }), sheetRun('H of PS 3 P4(b)', { preset: 'ps3_4b5', algo: 'fleury', params: { source: 'a' } }), sheetRun('Octahedron (circuit)', { preset: 'planar_oct', algo: 'fleury', params: { source: 'a' } }), sheetRun('K₅ (circuit)', { preset: 'k5', algo: 'fleury', params: { source: '1' } })] },
      { p: 'P2(a)', title: 'Hamiltonian? Find a Hamilton cycle or path', page: 3, note: 'Two methods: backtracking search, and the integer program with subtour constraints added one round at a time.', runs: [sheetRun('Petersen', { preset: 'petersen', algo: 'ham', params: { source: '0' } }), sheetRun('G', { preset: 'ps5_2g', algo: 'ham', params: { source: 'a' } }), sheetRun('H', { preset: 'ps5_2h', algo: 'ham', params: { source: 'a' } }), sheetRun('Petersen as an ILP', { preset: 'petersen', algo: 'ilp', params: { goal: 'ham' } }), sheetRun('G as an ILP', { preset: 'ps5_2g', algo: 'ilp', params: { goal: 'ham' } }), sheetRun('H as an ILP', { preset: 'ps5_2h', algo: 'ilp', params: { goal: 'ham' } })] },
      { p: 'P2(b)', title: 'Ore’s theorem: more than C(n − 1, 2) + 1 edges', page: 3 }] },
    { ps: 6, items: [{ p: 'P−1', title: 'TSP heuristics far from the optimum (Stanoyevitch 9.2.35, 9.2.10)', page: 1, note: 'Edit a small instance until nearest neighbour is clearly worse than the optimum the lab computes.', runs: [sheetRun('Courier stops', { preset: 'courier', algo: 'tsp', params: { source: 'A' } }), sheetRun('Courier stops as an ILP', { preset: 'courier', algo: 'ilp', params: { goal: 'tsp' } })] }] },
    { ps: 1, items: [{ p: 'P3', title: 'Traverse every arc once in a symmetric strongly connected digraph', page: 2 }] },
  ],
  flow: [
    { ps: 7, items: [
      { p: 'Flows', title: 'Is it a flow? Saturated edges, value (Grimaldi 13.1–13.2)', page: '1–2', note: 'Decide both flows on paper. The lab then gives the maximum value for the same network.', runs: [sheetRun('Network of Fig. 13.11', { preset: 'ps7_n1311', algo: 'ek', params: { source: 'a', sink: 'z' } })] },
      { p: 'Cuts', title: 'Capacity of the cuts C₁ and C₂', page: 2, note: 'In <b>Check a certificate</b> mode, click the source side of a cut: the lab reports its capacity and whether it is minimum.', runs: [sheetRun('Network of Fig. 13.11', { preset: 'ps7_n1311', algo: 'ek', params: { source: 'a', sink: 'z' } })] },
      { p: 'FF / EK', title: 'Ford–Fulkerson and Edmonds–Karp', page: '3–4', runs: [sheetRun('Network S → T', { preset: 'ps7_st', algo: 'ek', params: { source: 'S', sink: 'T' } }), sheetRun('Network (i)', { preset: 'ps7_ni', algo: 'ek', params: { source: 'a', sink: 'z' } }), sheetRun('Fig. 13.23', { preset: 'ps7_n1323', algo: 'ek', params: { source: 'a', sink: 'z' } })] }] },
  ],
  match: [
    { ps: 8, items: [
      { p: 'P1', title: 'Maximum matching, and a maximal one that is not maximum (Stanoyevitch ex. 19)', page: 2, note: 'G has triangles, so the bipartite methods do not apply: check your matching in <b>Check a certificate</b> mode. H is bipartite.', runs: [sheetRun('G', { preset: 'ps8_19g' }), sheetRun('H', { preset: 'ps8_19h', algo: 'kuhn' })] },
      { p: 'P2.1–2.2', title: 'Smallest maximal matching in Cₙ; perfect matchings in trees (West 3.1.2, 3.1.8)', page: 2 },
      { p: 'P2.3', title: 'Augmenting paths on two marriage problems; X-saturated? (Stanoyevitch Fig. 9.69)', page: '2–3', note: 'The lab scans the left side in the order listed in the edge list. Reorder the lines to start “from the bottom”.', runs: [sheetRun('(a)', { preset: 'ps8_969a', algo: 'kuhn' }), sheetRun('(b)', { preset: 'ps8_969b', algo: 'kuhn' })] },
      { p: 'P2.4', title: 'Maximum matching with a vertex cover as proof (West 3.1.1)', page: 3, runs: [sheetRun('Graph 1', { preset: 'ps8_311a', algo: 'kuhn' }), sheetRun('Graph 2', { preset: 'ps8_311b', algo: 'kuhn' }), sheetRun('Graph 3', { preset: 'ps8_311c', algo: 'kuhn' })] },
      { p: 'P2.6–2.7', title: 'k-regular bipartite graphs; a perfect-matching oracle', page: 3 },
      { p: 'P3', title: 'Stable marriage with Gale–Shapley', page: '3–4', note: 'Solve the tables on paper, then compare. Swapping who proposes can change the result.', runs: [sheetRun('Men propose', { algo: 'gs', params: { prefs: MARRIAGE_PS8 } }), sheetRun('Women propose', { algo: 'gs', params: { prefs: swapSides(MARRIAGE_PS8) } })] }] },
  ],
  color: [
    { ps: 9, items: [
      { p: 'P1.1–1.2', title: 'The map of Slovakia as a planar graph, and its dual', page: 2, note: 'Type one vertex per region and one edge per shared border into the edge list, then run the planarity test to see the faces and the dual.' },
      { p: 'P1.3', title: 'Is this graph planar?', page: 2, runs: [sheetRun('Planarity test', { preset: 'ps9_13', algo: 'planar' })] },
      { p: 'P1.4', title: 'A graph whose dual is isomorphic to itself', page: 2 },
      { p: 'P2', title: 'K₅ and K₃,₃ are nonplanar; West 6.1.1–6.1.10', page: 3, runs: [sheetRun('K₅', { preset: 'k5', algo: 'planar' }), sheetRun('K₃,₃', { preset: 'k33', algo: 'planar' }), sheetRun('Graph of 6.1.4', { preset: 'ps9_614', algo: 'planar' })] },
      { p: 'P3', title: 'Chromatic number; disjoint unions', page: '3–4', runs: [sheetRun('Exact χ', { preset: 'ps9_3', algo: 'exact' }), sheetRun('DSatur', { preset: 'ps9_3', algo: 'dsatur' })] }] },
  ],
  random: [
    { ps: 10, items: [
      { p: 'P1.1', title: 'Expected edges, degree, triangles and 2-paths in G(n, p)', page: 1, note: 'Compare your formulas with the counts the G(n, p) run reports.' },
      { p: 'P1.2', title: 'Expected edges of a random induced subgraph G[X]', page: 1 }] },
  ],
  dom: [
    { ps: 11, items: [
      { p: 'P1.1–1.2', title: 'Domination number of cycles and paths', page: 1, note: 'Collect γ for several n and guess the formula before you prove it.', runs: [6, 7, 8, 9].map(n => sheetRun(`C${'₀₁₂₃₄₅₆₇₈₉'[n]}`, { preset: 'ps11_c' + n, algo: 'exact' })).concat([6, 7, 8, 9].map(n => sheetRun(`P${'₀₁₂₃₄₅₆₇₈₉'[n]}`, { preset: 'ps11_p' + n, algo: 'exact' }))) },
      { p: 'P1.3–1.4', title: 'A connected graph with γ = k; diameter ≥ 3 implies γ(Ḡ) ≤ 2 (West 3.1.52)', page: 1 },
      { p: 'Tutorial 2', title: 'A greedy upper bound and a dynamic program for γ', page: 1, runs: [sheetRun('Greedy on the 4 × 4 grid', { preset: 'grid44', algo: 'greedy' })] }] },
  ],
  cagt: [
    { ps: 2, items: [{ p: 'P1', title: 'How many induced subgraphs? Enumerating all subgraphs', page: 1, note: 'The generator below lists graphs up to isomorphism; compare its counts with the labelled counts you derive.' }] },
  ],
};

/* Definition cards: practice problems on the sheets */
const SHEET_DEFS = {
  traverse: { 'Walk, trail, path, cycle': [[5, 'P1(b)', 1]], 'Eccentricity, radius, diameter': [[2, 'P2(a)', 1], [2, 'P4', 2]], 'Bipartite graphs and odd cycles': [[3, 'P1', 1]], 'DAG and topological order': [[1, 'P2(a)', 2]] },
  degrees: { 'Degree and the handshake lemma': [[1, 'P1', 2]], 'Graphical sequences': [[2, 'P3(a)', 2]], 'Havel–Hakimi': [[2, 'P3(b)', 2]], 'Cut vertex and bridge': [[2, 'P2(b–c)', 1], [3, 'P3(a)', 4]] },
  iso: { 'Isomorphism': [[3, 'P2', '1–4']], 'Invariants': [[3, 'P2', '1–4']] },
  mst: { 'Tree': [[3, 'P3', 4]], 'Spanning tree': [[3, 'P4(a–b)', 4]], 'Cut property': [[3, 'P4(c)', 5]], 'Cycle property': [[3, 'P4(c)', 5]] },
  sp: { 'Weighted distance': [[4, 'P4', '2–3']], 'Relaxation': [[6, 'P1', '2–3']], 'Negative cycle': [[6, 'P2', '3–5']] },
  route: { 'Euler circuit': [[5, 'P1', '1–2'], [5, 'P1.8 (Fleury)', 2]], 'Hamilton cycle': [[5, 'P2', 3]], 'Subtour elimination': [[5, 'P2(a)', 3], [6, 'P−1', 1]], 'Triangle inequality and shortcuts': [[6, 'P−1', 1]] },
  flow: { 'Flow network and flow': [[7, 'flows', '1–2']], 'Residual network': [[7, 'FF / EK', '3–4']], 'Augmenting path': [[7, 'FF / EK', '3–4']], 's–t cut': [[7, 'cuts', 2]] },
  match: { 'Matching: maximal vs maximum': [[8, 'P1', 2], [8, 'P2.1', 2]], 'Augmenting path': [[8, 'P2.3', '2–3']], 'Vertex cover and König': [[8, 'P2.4', 3]], 'Hall’s condition': [[8, 'P2.6', 3]], 'Stable matching': [[8, 'P3', '3–4']] },
  color: { 'Proper colouring and χ': [[9, 'P3', '3–4']], 'Planar graph and faces': [[9, 'P1', 2]], 'Euler’s formula': [[9, 'P2', 3]], 'Dual graph': [[9, 'P1.2, P1.4', 2]] },
  random: { 'G(n, p)': [[10, 'P1.1', 1]], 'Indicator variables': [[10, 'P1', 1]] },
  dom: { 'Dominating set': [[11, 'P1', 1]] },
  cagt: { 'Isomorphism classes': [[2, 'P1', 1]] },
};
const sheetRefs = L => L.map(([n, p, pg]) => sheetLink(n, `PS ${n}, ${p}`) + (pg ? ` (${pagesText(pg)})` : '')).join('; ');

/* Motivating tasks: point to the sheet problem that uses the same idea */
const SHEET_MOTIV = {
  traverse: [2, 'P2(a)', 'asks the same distance questions on three small graphs'],
  degrees: [2, 'P3', 'asks the same question for ten degree sequences'],
  iso: [3, 'P2', 'has twelve sets of drawings to sort in the same way'],
  mst: [3, 'P4(b)', 'gives four more networks for Kruskal and Prim'],
  sp: [6, 'P2', 'asks you to choose the algorithm for ten kinds of network'],
  route: [5, 'P1–P2', 'separates the Euler and the Hamilton question on small graphs'],
  flow: [7, 'flows and cuts', 'works through the same ideas on Grimaldi’s networks'],
  match: [8, 'P2.3 and P3', 'pose placement problems of the same shape, the second with preferences'],
  color: [9, 'P1', 'starts from a map of Slovakia: the same modelling step for regions instead of exams'],
  random: [10, 'P1', 'computes the expected counts the comparison needs'],
  dom: [11, 'P1', 'asks the same question for cycles and paths'],
};

/* attach: definition cards get a "Practice" line; motivating tasks get a pointer to the sheet */
for (const m of MODULES) {
  const D = SHEET_DEFS[m.key] || {};
  for (const d of DEFS[m.key] || []) if (D[d.term]) d.practice = D[d.term];
  const M = SHEET_MOTIV[m.key];
  if (M && m.tasks[0] && m.tasks[0].tag === 'Motivation') m.tasks[0].text += ` <span class="sheetref">On paper: ${sheetLink(M[0], `PS ${M[0]}, ${M[1]}`)} ${M[2]}.</span>`;
}
