// Shared public destinations for navigation, metadata and server integrations.
export const bilibiliUid = '1079503056'
export const contactEmail = 'contact@everglowmod.com'

export const siteLinks = {
  bilibili: `https://space.bilibili.com/${bilibiliUid}`,
  bilibiliFeed: `https://rsshub-balancer.virworks.moe/bilibili/user/video/${bilibiliUid}/1?format=json`,
  discord: 'https://discord.gg/pdXvp89Dbp',
  github: 'https://github.com/CycloneClub/Everglow',
  wiki: 'https://terrariamods.wiki.gg/wiki/Everglow',
  qq: 'https://qun.qq.com/universal-share/share?ac=1&authKey=5nBifgbaY3setkqccaqepjXLIo3kjpIu9dAxhtt2Rlz6VWUZXONGX0X6spBmje3r&busi_data=eyJncm91cENvZGUiOiI4OTU0NDg4NDYiLCJ0b2tlbiI6Imw2Q3owZDB2cjJ2THJUQ2NVTXVjNGthNXZRTktlajFYdlQyNHVmUFg2YzI2T05IR3BEL0FJeFh5b2xQRzg5TFciLCJ1aW4iOiI4NzcxODM2MjkifQ%3D%3D&data=snIUXs1g5srG940sU_SkQ5aGlGwk1l2_6eXMKsmED7H_RV2yTZXMkY_z9Es2mBCgfqFE_2BNr-GDN4Ut8euYpA&svctype=4&tempid=h5_group_info',
  tmodloader: 'https://www.tmodloader.net/',
  terraria: 'https://terraria.org/',
  email: `mailto:${contactEmail}`,
} as const
