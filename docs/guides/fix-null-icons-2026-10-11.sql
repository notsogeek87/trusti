UPDATE applications a
SET icon = v.icon, updated_at = now()
FROM (VALUES
  ('0e8b8389-82d7-472b-833c-73ccaae35b74','https://play-lh.googleusercontent.com/lvMiHeEMBIXGBrFT65UNJksSgNrm3NzCkURiSJvHLI8LVR4kLZ9e_STSluUKKspHK3tMc4H--WORsxTKxR75vg'),
  ('fd66c76d-2981-4a73-bf14-f82c107ec0bb','https://play-lh.googleusercontent.com/2CR6ecP2mz281zfOZZoZS4kdZg1WaGfCXdQxdWmt2JkQRDSQG8NhdbgIuH0UepzEyrWTKA7zaqre6xAthebFwyA'),
  ('6afcf783-101a-48f9-9c0f-c65fbf4844f3','https://play-lh.googleusercontent.com/6MgKZ2d5II_D1g7n2SoRw432FjHLhan-s49IQr6MaPhmPQrE1W1hkKkleMIMh2xMjn69uhzVK8_-yNtqN3qbbw'),
  ('43d8c0c2-bccb-4def-8bb0-377979a64b40','https://play-lh.googleusercontent.com/yuBbAZWwGEDAS94hnfH_7b46lf2gXYdCekPngJyYfuRmVXpjXuRDOVW2BOn8YhtpmwixUxu04n9NaraVJLQaBGs'),
  ('8cb85326-31c2-4139-a8b6-8057da1d86fe','https://play-lh.googleusercontent.com/WdTUEQXkFC6WEtSAs6WP3uV7L-v4T3D6IyESPP4yRwo8Xs_ZiQ_AbGRiWVDq3NN6GXBFToc0gvTdMVwkxsQhfw'),
  ('656d9cf1-61fb-4871-aa3c-d29fc9ce3d5d','https://play-lh.googleusercontent.com/3c2qJKjX3md2W7mr0zlazZnQ-eGettF8G4w4H12LVQ1GlkE3bzZE5vi66Zfg3_MonnU6Nc41jWD8IwURBwev7g'),
  ('008865a4-a7f2-45bc-b996-2e8d121a743c','https://play-lh.googleusercontent.com/Oy8bbVOACpQsG-1SVj1KgA_6hL1mGS8iI1zy9Z0NgK2Kz_dLyDNfpDFDY0BmKN52x9Y4vvHfcQYF8wVeW5K5zQ'),
  ('26fce259-fa0b-49b3-bd3f-03c053a66004','https://play-lh.googleusercontent.com/p5ZAjWVXkOQKCyYalT40_WNL5LsP1s2W4eAQ06M71s9MeHJ6OColiqINcI-ctNe16TWIrkN8IdIm8xlSvNXB5_g'),
  ('e688f70b-cb20-4ff2-84bd-7e75ef2a0f66','https://play-lh.googleusercontent.com/o8eqD9ANG6nvheY8liFgcpQd8eOfEKiFh-1hQ0k0QIQzCr7Oo1PvHI1Pdt2nGSGS6_MHq-ywqoBkdOcv40XG'),
  ('9d992d62-26cb-4327-9238-a641cbb1006a','https://play-lh.googleusercontent.com/xOKPdCi1rudjFFUTYYKMuaNQx_AhOY4CN2GV1VjTToQjn35QQ7mkpHkqcDh3IDs4Zq2yIQiah-HRs5_HMC-fDQ'),
  ('ab9de203-76c0-4f17-b309-2758c925cad4','https://play-lh.googleusercontent.com/pgVQxkLlqxlTpCKNK4ADaOvaTHwZtv-KSK-y4zNjLkQPeDEeUM3Jr-jP-8y2_uk1hLwwexXb0epCbEhua_bo'),
  ('4aff9225-cc04-4482-a9bd-fe013248e6d6','https://play-lh.googleusercontent.com/FUX_gKUe25i7EQgggy8E7ZbjLF6MME86rhx0yAJIOBVAS-EBrGbg04ORiJCFfU_zacS098uiiOQ2zCj0PyeAxA'),
  ('c9418ada-067e-4c3a-a67c-c889509490b1','https://play-lh.googleusercontent.com/TMdf3UBoH52CnGftvpvvO60BGoAN1CZC0iaWiHsvAol1E3MeELiw2ool1zjm3CqY41rrH4jy7S0344opq3HEHw'),
  ('5c76d8f3-0aa7-41f5-b108-3f4bbf728fc5','https://play-lh.googleusercontent.com/PXpj7MDNgb4TaupBBdNM4vsU6Y-AXuoD74Jy5zdUJFYqggGIaOgZJOIUAN5ROXqfHTXeUWzN9ViD1o5nCmsmiA'),
  ('ae719b47-6c36-477f-8a0e-1754f9abed86','https://play-lh.googleusercontent.com/WyF-QWgtg-2pOzgKvvi0FHzthF9_zBEPay8RyH03LIhy7G1AlQgDJj-w_429zN1juJ7O6_8P9G_zTJBTZD-J'),
  ('41605478-79ff-4f2c-802d-2159b4b23a4b','https://play-lh.googleusercontent.com/TGyfhBApmvchUr6hVCoRiJFBUgWBzYSIQXaWbPbFxtkiBwVIkvIC-FTVn4V29Sa-tsxG0aozr0fjHW7cb9VMKA'),
  ('f7643ff8-c40f-4c10-80d7-6abca259a543','https://play-lh.googleusercontent.com/37j2OgHUHteYPoGmC9bGGt-JQVhqdiabuaPWvfZ1vZFe3GpR2_AdjgBcNvCjgR0_bGwPDgiGFaepTvWpmuNcow'),
  ('edf71af0-dd40-490e-98d3-c8d68e7c75ba','https://play-lh.googleusercontent.com/ET72SbmXDIsYvFjTbHMJgvMPERiQtXSnHzWDJlkiqTBNghb8-1DigjxzgSfO3esWZfKpS4MydFEBNvMK1Aa6'),
  ('f8dcbfb1-1120-4f8a-80dd-26c6070df023','https://play-lh.googleusercontent.com/4C5IL08-0tXfj7QRpbxUXishMAZZjCh-Xux0qtGEIq74Myo7c6D1bQM7ShiQ5KLz7n4wu85ojMpIn0INjld5JA'),
  ('7b55b426-2339-4768-918b-cb447f61a1d1','https://play-lh.googleusercontent.com/zRcDQ9BphMdir8eTukIWRH1KeIe4mGJSb3sIMfUzJZoCeCDjjBsTC1fv5UQr1XQ1_3LsrUqBrEv7tqYHxhLYhw')
) AS v(id, icon)
WHERE a.id = v.id AND (a.icon IS NULL OR a.icon = '');
