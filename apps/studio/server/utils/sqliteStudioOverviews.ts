export const sqliteStudioOverviews = `
 SELECT s.id,s.name,s.created_at AS createdAt,m.role,
 json_array_length(d.body,'$.boards') AS boardCount,
 (SELECT COUNT(*) FROM members WHERE workspace_id=s.id) AS memberCount,
 (SELECT json_group_array(json_object('id',p.id,'name',p.name,'color',p.color,'avatar',p.avatar)) FROM
   (SELECT p.id,p.name,p.color,p.avatar FROM profiles p JOIN members mm ON mm.user_id=p.id WHERE mm.workspace_id=s.id ORDER BY p.id LIMIT 3) p) AS members,
 (SELECT json_group_array(json_object('id',json_extract(n.value,'$.id'),'title',substr(json_extract(n.value,'$.data.title'),1,50),
   'kind',json_extract(n.value,'$.data.kind'),'x',json_extract(n.value,'$.position.x'),'y',json_extract(n.value,'$.position.y'))) FROM
   (SELECT value FROM json_each(d.body,'$.boards[0].nodes') LIMIT 16) n) AS nodes,
 (SELECT json_group_array(json_object('source',json_extract(e.value,'$.source'),'target',json_extract(e.value,'$.target'))) FROM
   (SELECT value FROM json_each(d.body,'$.boards[0].edges') LIMIT 32) e) AS edges
 FROM studios s JOIN members m ON m.workspace_id=s.id JOIN documents d ON d.workspace_id=s.id
 WHERE m.user_id=? ORDER BY s.created_at,s.id`
