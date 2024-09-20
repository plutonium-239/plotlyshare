import datad from '../../oldproj/everything.json'
// let meta = new Map(Object.entries(data.find(({ key }) => {key == 'METADATA'})!!.plots))
let metad = {
    "118c1e36908a1d22fd3485b2764f1f92":{"name":"gpt2 predict_T=10 individual_slope_6393 0","time_created":"2024-07-29T17:45:36+0530","timestamp":1722255336},
    "143ba66e4edb73466e059b4bf84425ac":{"name":"gpt2 predict_T=1 clever_turkey_7792 1","time_created":"2024-07-30T12:04:11+0530","timestamp":1722321251},
    "199d00f2edaa63a701d26de36da2c3ce":{"name":"gpt2 predict_T=5 ill_guppy_748 0","time_created":"2024-07-30T11:32:06+0530","timestamp":1722319326},
    "2b26f080a7f2b26b0ca5c65d8f551911":{"name":"mamba predict_T=1 evolutionary_bracket_7225 2","time_created":"2024-07-29T23:40:58+0530","timestamp":1722276658},
    "3be41b2048202b779ca079d15e209156":{"name":"mamba predict_T=1 evolutionary_bracket_7225 1","time_created":"2024-07-29T23:40:51+0530","timestamp":1722276651},
    "5513240df31e2338910ca9848071cbc1":{"name":"gpt2 predict_T=1 clever_turkey_7792 0","time_created":"2024-07-30T12:03:48+0530","timestamp":1722321228},
    "69558d6b84640194fd186ff9fb411ea0":{"name":"gpt2 predict_T=10 individual_slope_6393 3","time_created":"2024-07-29T17:46:12+0530","timestamp":1722255372},
    "702a0bd44b0088211c340fede8a6dff9":{"name":"gpt2 predict_T=1 clever_turkey_7792 3","time_created":"2024-07-30T12:04:25+0530","timestamp":1722321265},
    "770069738020858cd94b178282806653":{"name":"mamba predict_T=1 evolutionary_bracket_7225 3","time_created":"2024-07-29T23:41:04+0530","timestamp":1722276664},
    "8ea0ebc6b04a1a7e3727360ee13df288":{"name":"gpt2 predict_T=5 ill_guppy_748 2","time_created":"2024-07-30T11:32:35+0530","timestamp":1722319355},
    "a9d8c8c741d029af2a1119335f74fec5":{"name":"gpt2 predict_T=5 ill_guppy_748 3","time_created":"2024-07-30T11:32:43+0530","timestamp":1722319363},
    "aa9f30f2e077056d8b4ef49100620c10":{"name":"gpt2 predict_T=10 individual_slope_6393 2","time_created":"2024-07-29T17:46:05+0530","timestamp":1722255365},
    "c0952864647f86bc31cd5f66ec1e9258":{"name":"gpt2 predict_T=1 clever_turkey_7792 2","time_created":"2024-07-30T12:04:19+0530","timestamp":1722321259},
    "c190bf7d2100209ed553cbaa836d4ca2":{"name":"mamba predict_T=1 evolutionary_bracket_7225 0","time_created":"2024-07-29T23:40:30+0530","timestamp":1722276630},
    "d4377250262a21778664c69188574986":{"name":"gpt2 predict_T=5 ill_guppy_748 1","time_created":"2024-07-30T11:32:27+0530","timestamp":1722319347},
    "d49cc2ad92fb84d3210125fae9ff11da":{"name":"gpt2 predict_T=10 individual_slope_6393 1","time_created":"2024-07-29T17:45:58+0530","timestamp":1722255358}
}
export const data = datad.sort((a,b) => {return a.name.localeCompare(b.name)}) ;
export const meta = new Map(Object.entries(metad))