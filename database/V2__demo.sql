INSERT INTO boards(id,created_at,name,description) VALUES ('10000000-0000-0000-0000-000000000001',now(),'Ürün geliştirme','Fikirden ilk sürüme, birlikte.');
INSERT INTO stages(id,created_at,board_id,name,position) VALUES
 ('10000000-0000-0000-0000-000000000002',now(),'10000000-0000-0000-0000-000000000001','Yapılacak',0),
 ('10000000-0000-0000-0000-000000000003',now(),'10000000-0000-0000-0000-000000000001','Devam ediyor',1),
 ('10000000-0000-0000-0000-000000000004',now(),'10000000-0000-0000-0000-000000000001','Tamamlandı',2);
INSERT INTO cards(id,created_at,stage_id,title,description,assignee,label,priority,due_date) VALUES
 ('10000000-0000-0000-0000-000000000005',now(),'10000000-0000-0000-0000-000000000002','Kullanıcı görüşmelerini planla','İlk kullanıcı grubundan geri bildirim toplayalım.','Deniz','Araştırma','HIGH',CURRENT_DATE+3),
 ('10000000-0000-0000-0000-000000000006',now(),'10000000-0000-0000-0000-000000000002','Bildirim tercihlerini tasarla','E-posta ve uygulama içi bildirimlerin akışını netleştir.','Ece','Tasarım','NORMAL',CURRENT_DATE+5),
 ('10000000-0000-0000-0000-000000000007',now(),'10000000-0000-0000-0000-000000000003','API yanıtlarını standartlaştır','Başarılı ve hatalı yanıtların sözleşmesini tamamla.','Bora','Geliştirme','NORMAL',CURRENT_DATE+1),
 ('10000000-0000-0000-0000-000000000008',now(),'10000000-0000-0000-0000-000000000003','Mobil görünümü düzenle','Küçük ekranlarda kartların okunabilirliğini kontrol et.','Ece','Tasarım','HIGH',CURRENT_DATE+2),
 ('10000000-0000-0000-0000-000000000009',now(),'10000000-0000-0000-0000-000000000004','Proje kapsamını belirle','İlk sürümün temel akışları hazır.','Deniz','Planlama','NORMAL',NULL);
