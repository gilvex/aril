export const postgresStudioOverviews = `
 SELECT s.id,s.name,s.created_at AS "createdAt",m.role,
 jsonb_array_length(d.body->'boards') AS "boardCount",
 (SELECT COUNT(*)::int FROM studio.members WHERE workspace_id=s.id) AS "memberCount",
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'color',p.color)) FROM
   (SELECT p.id,p.name,p.color FROM studio.profiles p JOIN studio.members mm ON mm.user_id=p.id WHERE mm.workspace_id=s.id ORDER BY p.id LIMIT 3) p),'[]'::jsonb) AS members,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',n.value->>'id','title',left(n.value#>>'{data,title}',50),
   'kind',n.value#>>'{data,kind}','x',n.value#>'{position,x}','y',n.value#>'{position,y}')) FROM
   (SELECT value FROM jsonb_array_elements(d.body#>'{boards,0,nodes}') LIMIT 16) n),'[]'::jsonb) AS nodes,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('source',e.value->>'source','target',e.value->>'target')) FROM
   (SELECT value FROM jsonb_array_elements(d.body#>'{boards,0,edges}') LIMIT 32) e),'[]'::jsonb) AS edges
 FROM studio.studios s JOIN studio.members m ON m.workspace_id=s.id JOIN studio.documents d ON d.workspace_id=s.id
 WHERE m.user_id=$1 ORDER BY s.created_at,s.id`
