-- Rename "Resultados Diários" channel to "Notícias do Mercado"
UPDATE channels 
SET 
  name = 'Notícias do Mercado',
  slug = 'noticias-mercado',
  description = 'Notícias em tempo real do mercado Forex',
  icon = 'newspaper'
WHERE slug = 'resultados-diarios' OR name = 'Resultados Diários';