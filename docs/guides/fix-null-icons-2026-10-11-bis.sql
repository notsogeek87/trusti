UPDATE applications a
SET icon = v.icon, updated_at = now()
FROM (VALUES
  ('9126f880-0743-4ce1-b2ff-e079e2eebc75','https://play-lh.googleusercontent.com/QZ22cF3XbLkmEI2GofoWjqHLR3NXBM9y5XjpazOiFOIeSWaDTcfm4Rh1BKNswYyL9eYnYVj2YJPkY4FAL0o6'),
  ('0a52cadc-02b9-44f4-a186-8c9443e62996','https://play-lh.googleusercontent.com/Fix5LYECSoJKroxv-6yroJawJNGPB9OWuzFzFxd3ekxYUHTzV6gKeB_fSmvLrl7LHc9P3FDQEbwg7FnoR1xp'),
  ('c63d5c5f-d531-45cb-8734-26503791b2a9','https://play-lh.googleusercontent.com/Jz5vb2Kd0ChmNm7PtwsgnbuJqDW44Ltg-MZVUiokKCKCXmGAMUNlXIcs16zjdTf2-5-OvKIjy526c2gc8iP7i30'),
  ('842d8a59-957b-4808-9a94-581f61cf813b','https://play-lh.googleusercontent.com/FuMtCWmDB3bjjKWnNAeKVg_19DoVQoR2cnGqfybhScxBXl7HidTbg4tG_sxZfqyMOPHHlFnRkQigCJJ2n0wqgw'),
  ('07010b21-cf06-427c-b134-068ec45c7838','https://play-lh.googleusercontent.com/l9Jmvj-II3QoivcvhEiaB-5qnZnuNitaOmIb-zT_3FoZyCuB5aD8_N1gsCKJZoj_UxdRT1SoBouGhj5kWTTALA4'),
  ('e7f90d00-1430-4428-a57e-a3e617696816','https://play-lh.googleusercontent.com/uAwm0qskz7Z07d4YtjlGSHBTBxEBOJgB_bAOgODVVm8IKljav-0pHXGJX5M-z9BPm06tBIwkc0mIylOgqqv9k1s'),
  ('e0873ace-83dd-4ffe-aa41-0962fc5d1a5d','https://play-lh.googleusercontent.com/KZ-BB-slIBDydaUc8SJp3Sfi4p-oX78A0vqc2fjalo_ml7DkA80AV6aFcmRmfB1Hq-Aflir_rGqxFxIh37skkQA'),
  ('1f03d066-a579-46cb-8d04-35582fcee5d0','https://play-lh.googleusercontent.com/l7M0nbEvTXcmqxVHJ0lGVc9nDEWGtMSb759oa3Mhjctp-6QgbAYZ4ufhTzAIqKbIJhqw1soyqaR9-TM9oFi3'),
  ('dedf893d-f0d2-4abf-b7e5-e8e0de70696d','https://play-lh.googleusercontent.com/svYPOxOnLB4GNn0mEtyukPJxKbAyc3PthMo7x12BlMv-OjRhxUY8L2SK4tQYd7HwpfZ6K0XqEkIEiLWZzTW2_Zk'),
  ('03c726b4-b02b-4d3a-b1d3-139a77fb2d5a','https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/icon.png'),
  ('366157c5-553e-4db8-a9f7-e0cdce383bea','https://raw.githubusercontent.com/jksalcedo/librefind/main/fastlane/metadata/android/en-US/images/icon.png'),
  ('f5f275aa-fca3-46c8-bcb5-4d14db9d233b','https://f-droid.org/assets/apple-touch-icon_ypJwtCrcixeH_qV6LdcMYk1anFIR9o-_ufR__1wNdJY=.png')
) AS v(id, icon)
WHERE a.id = v.id AND (a.icon IS NULL OR a.icon = '')
RETURNING a.name