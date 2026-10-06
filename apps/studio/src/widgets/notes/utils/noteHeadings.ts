export function noteHeadings(body: string) {
  let fence = ''
  return body.split('\n').flatMap((line, index) => {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]
    if (marker) {
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length)
        fence = ''
      return []
    }
    if (fence) return []
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    return heading
      ? [{ line: index + 1, depth: heading[1].length, title: heading[2] }]
      : []
  })
}
