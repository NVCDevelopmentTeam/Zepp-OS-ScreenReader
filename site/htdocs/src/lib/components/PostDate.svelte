<script>
  import { format, parseISO } from 'date-fns'

  export let post
  export let collapsed = false

  let _class
  export { _class as class }
</script>

<div class={['relative z-10 mb-3 flex font-dj tracking-tight text-gray', _class].join(' ')}>
  <div class="flex" class:flex-col={!collapsed}>
    <time datetime={post.date}>
      {format(new Date(parseISO(post.date)), 'MMMM d, yyyy')}
    </time>
  </div>
</div>
