"" Initialize global variables
" https://stackoverflow.com/questions/4976776/how-to-get-path-to-the-current-vimscript-being-executed/4977006
" https://github.com/tonsky/FiraCode
let g:vim_home_path = fnamemodify(resolve(expand('<sfile>:p')), ':h')
let g:placeholder = '<++>'

let g:plug_path = g:vim_home_path . '/autoload/plug.vim'
let g:first_install = empty(glob(g:plug_path))

"" Security
set nomodeline modelines=0

"" Compatibility
set guicursor= " don't want unknown characters in linux
" set t_co=256

" Getting terminal colors to work
" https://medium.com/@dubistkomisch/how-to-actually-get-italics-and-true-colour-to-work-in-iterm-tmux-vim-9ebe55ebc2be

" if has('nvim') && $GOOD_TERM == '1'
"   let &t_8f="\<Esc>[38;2;%lu;%lu;%lum"
"   let &t_8b="\<Esc>[48;2;%lu;%lu;%lum"
"   set termguicolors
" endif

"" Plugins
execute 'source ' . g:vim_home_path . '/plugins-list.vim'

"" Keybindings
execute 'source ' . g:vim_home_path . '/keybindings.vim'

"" Colors
execute 'source ' . g:vim_home_path . '/visual.vim'

if has('wildmenu')
  set wildignorecase wildmenu
  " set wildmode=longest,list
endif
set splitright splitbelow
set ignorecase smartcase " Ignore case in searching except when including capital letters

" https://shapeshed.com/vim-statuslines/

" Hiding the UI
" https://unix.stackexchange.com/questions/140898/vim-hide-status-line-in-the-bottom
let s:hidden_all = 0
function! ToggleHiddenAll()
  if s:hidden_all  == 0
    let s:hidden_all = 1
    set noshowmode
    set noruler
    set laststatus=0
    set noshowcmd
    set nocul
    set cc=
  else
    let s:hidden_all = 0
    set showmode
    if &ft != 'netrw'
      set ruler
      set cul
      set cc=80
    endif
    set laststatus=2
    set showcmd
  endif
endfunction

" nnoremap <S-h> :call ToggleHiddenAll()<CR>

" Clipboard
set clipboard=unnamedplus

" Folding
" https://vim.fandom.com/wiki/Keep_folds_closed_while_inserting_text
autocmd InsertEnter *
  \ if !exists('w:last_fdm') |
    \ let w:last_fdm=&foldmethod |
    \ setlocal foldmethod=manual |
  \ endif
autocmd InsertLeave,WinLeave *
  \ if exists('w:last_fdm') |
    \ let &l:foldmethod=w:last_fdm | unlet w:last_fdm |
  \ endif

" Syntax Highlighting
filetype plugin indent on " Filetype detection
syntax enable " Actual highlighting

" Showing non-printing characters
set list
set showbreak=↪
set listchars=tab:»\ ,extends:›,precedes:‹,nbsp:·,trail:· " ,eol:↲

"" Indenting
set tabstop=2 expandtab shiftwidth=2
set foldlevelstart=4

" Markdown and Jekyll Settings
function! MarkdownJekyllSettings()
  let l:begin=getline(1)
  if l:begin == "---"
    set tabstop=3 shiftwidth=3
  endif
endfunction

augroup KramdownHighlighting
  autocmd!
  autocmd BufRead,BufNewFile,BufEnter *.md,*.markdown
    \ call MarkdownJekyllSettings()
  autocmd BufLeave *.md,*.markdown
    \ set tabstop=2 | set shiftwidth=2
augroup END



"" Formatting
augroup autoformat_settings
  autocmd FileType bzl AutoFormatBuffer buildifier
  autocmd FileType c,cpp,proto,java AutoFormatBuffer clang-format
  autocmd FileType javascript AutoFormatBuffer prettier
  autocmd FileType dart AutoFormatBuffer dartfmt
  autocmd FileType go AutoFormatBuffer gofmt
  autocmd FileType gn AutoFormatBuffer gn
  " autocmd FileType html,css,sass,scss,less,json AutoFormatBuffer js-beautify
  " autocmd FileType python AutoFormatBuffer yapf
  " Alternative: autocmd FileType python AutoFormatBuffer autopep8
  autocmd FileType vue AutoFormatBuffer prettier
augroup END



"" Saving my ass
set undofile
execute 'set undodir=' . g:vim_home_path . '/undohist'



"" Commands
" TODO Make a toggle for showing column on left hand side

" TODO Fix this command
" command! -nargs=* AL aboveleft
" command! BR belowright
command! RunInit so $MYVIMRC

" Vim tab-local working directories
command! -nargs=1 -complete=dir Cd let t:wd=fnamemodify(<q-args>, ':p:h') | exe "cd" t:wd
augroup TabContext
  " http://vim.1045645.n5.nabble.com/Different-working-directories-in-different-tabs-td4441751.html
  au TabEnter * if exists("t:wd") | exe "cd" t:wd | endif
augroup END

" command! Root exe "Rooter" | let t:wd=getcwd()

" https://github.com/junegunn/fzf.vim/issues/251
" command! -nargs=? -complete=dir FD call
"   \ fzf#run(fzf#wrap(
"   \ {'source': 'find '
"   \ . (<q-args> == '' ? fnamemodify('.', ':p:h') : fnamemodify(<q-args>, ':p:h'))
"   \ . ' -type d',
"   \  'sink': 'Cd'}))



"" netrw
" Folders n stuff
let g:netrw_sort_sequence='[\/]$,\<core\%(\.\d\+\)\=\>,'

" Docs
let g:netrw_sort_sequence.= 'README,LICENSE,*.md$,*.markdown$,'

" C and C++ Files
let g:netrw_sort_sequence.= '\.h$,\.c$,\.cpp$,'

" Java files
let g:netrw_sort_sequence.= '\.java$,'

" The vast majority of files
let g:netrw_sort_sequence.= '\~\=\*$,*,'

" Files that begin with the '.' character, and other mildly hidden files
let g:netrw_sort_sequence.= '^\..*$,'

" Compiled files
let g:netrw_sort_sequence.= '\.o$,\.obj$,\.class$,'

" Vim files? Text editor info files and dumb files
let g:netrw_sort_sequence.= '\.info$,\.swp$,\.bak$,^\.DS_Store$,\~$'
