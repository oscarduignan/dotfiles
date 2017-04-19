;; Added by Package.el.  This must come before configurations of
;; installed packages.  Don't delete this line.  If you don't want it,
;; just comment it out by adding a semicolon to the start of the line.
;; You may delete these explanatory comments.
(package-initialize)
(package-install 'use-package)

(eval-when-compile
  (require 'use-package))
(require 'diminish)
(require 'bind-key)

(use-package ergoemacs-mode
  :ensure t
  :init
  (setq ergoemacs-theme nil)
  (setq ergoemacs-keyboard-layout "gb"))

;; (use-package smartparens
;;   :ensure t)

;; (use-package highlight-indentation
;;   :ensure t)

;; (use-package highlight-numbers
;;   :ensure t)

;; (use-package indent-guide
;;   :ensure t)

(use-package highlight-parentheses
  :ensure t
  :config
  (highlight-parentheses-mode 1)
  )

(use-package rainbow-delimiters
  :ensure t
  :config
  (rainbow-delimiters-mode 1)
  )

(use-package ivy
  :ensure t
  :config
  (ivy-mode 1)
  )

(use-package spacemacs-theme
  :ensure t
  :defer t
  :init
  (load-theme 'spacemacs-dark t)
  )

(use-package yaml-mode
  :ensure t
  )

(use-package dockerfile-mode
  :ensure t)

(use-package magit
  :ensure t
  :init
  (setq magit-display-buffer-function #'magit-display-buffer-fullframe-status-v1)
  )

(use-package which-key
  :diminish which-key-mode
  :ensure t
  :config
  (which-key-mode 1)
  )

(use-package ace-jump-mode
  :ensure t)

(use-package company
  :diminish company-mode
  :ensure t
  :commands global-company-mode
  :config
  (use-package company-emoji)
  (use-package company-elisp)
  (use-package company-files)
  (use-package company-yasnippet)
  (setq company-backends
	'( company-emoji
	   company-elisp
	   company-files
	   company-yasnippet ))
  (global-company-mode 1))

;(use-package yasnippet
  ;:ensure t
  ;:commands ( yas-global-mode yas-minor-mode
              ;yas-expand yas-expand-snippet
              ;yas-activate-extra-mode )
  ;:diminish (yas-minor-mode . " y")
  ;(setq yas-snippet-dirs
    ;'( "~/.emacs.d/.snippets/yasnippet-snippets"
       ;"~/.emacs.d/.snippets/personal")))

;; (use-package adaptive-wrap
;;   :ensure t)

;; (use-package git-gutter
;;   :diminish git-gutter-mode
;;   :ensure t
;;   :commands global-git-gutter-mode)

;(use-package flycheck
  ;:diminish flycheck-mode
  ;:ensure t
  ;:commands ( global-flycheck-mode flycheck-mode
              ;counsel-flycheck
              ;flycheck-define-checker counsel-flycheck
              ;flycheck-error-list-refresh
              ;flycheck-error-list-set-source
              ;flycheck-error-list-reset-filter ))

;; (use-package ledger-mode
;;   :mode "\\.journal\\'"
;;   :ensure t
;;   :init
;;   (setq ledger-mode-should-check-version nil
;; 	ledger-report-links-in-register nil
;; 	ledger-binary-path "hledger"))
;;   ;:config
;;   ;(use-package flycheck-ledger
;;     ;:ensure t))

;; (use-package evil
;;   :ensure t
;;   :init
;;   (setq evil-default-cursor t)
;;   (setq evil-emacs-state-cursor '("red" box))
;;   (setq evil-normal-state-tag   (propertize "[Normal]" 'face '((:background "green" :foreground "black")))
;; 	evil-emacs-state-tag    (propertize "[Emacs]" 'face '((:background "orange" :foreground "black")))
;; 	evil-insert-state-tag   (propertize "[Insert]" 'face '((:background "red" :foreground "black")))
;; 	evil-motion-state-tag   (propertize "[Motion]" 'face '((:background "blue")))
;; 	evil-visual-state-tag   (propertize "[Visual]" 'face '((:background "grey80" :foreground "black")))
;; 	evil-operator-state-tag (propertize "[Operator]" 'face '((:background "purple"))))
;;   :config
;;   (use-package evil-leader
;;     :ensure t
;;     :init
;;     (setq evil-leader/in-all-states t)
;;     :config
;;     (global-evil-leader-mode 1)
;;     (evil-leader/set-leader "C-SPC")
;;     (evil-leader/set-key
;; 	"j" 'ace-jump-mode
;; 	"g" 'magit-status
;; 	"r" 'ivy-recentf
;; 	"s" 'swiper
;; 	"H" 'which-key-show-top-level
;; 	;; "a" 'ag-project
;; 	;; "A" 'ag
;; 	;; "b" 'ido-switch-buffer
;; 	;; "c" 'mc/mark-next-like-this
;; 	;; "C" 'mc/mark-all-like-this
;; 	;; "e" 'er/expand-region
;; 	;; "E" 'mc/edit-lines
;; 	;; "f" 'ido-find-file
;; 	;; "i" 'idomenu
;; 	;; "k" 'kill-buffer
;; 	;; "K" 'kill-this-buffer
;; 	;; "o" 'occur
;; 	;; "p" 'magit-find-file-completing-read
;; 	;; "r" 'recentf-ido-find-file
;; 	;; "s" 'ag-project
;; 	;; "t" 'bw-open-term
;; 	;; "T" 'eshell
;; 	;; "w" 'save-buffer
;; 	;; "x" 'smex
;; 	)
;;     )
;;     (evil-mode 1)
;;   )

(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(global-hl-line-mode t)
 '(hl-paren-background-colors (quote ("gray28")))
 '(inhibit-startup-screen t)
 '(initial-buffer-choice t)
 '(package-selected-packages
   (quote
    (smartparens rainbow-delimiters indent-guide highlight-numbers highlight-indentation evil-leader evil company adaptive-wrap ace-jump-mode which-key magit dockerfile-mode yaml-mode use-package)))
 '(scroll-bar-mode nil)
 '(tool-bar-mode nil))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(default ((t (:inherit nil :stipple nil :background "#292b2e" :foreground "#b2b2b2" :inverse-video nil :box nil :strike-through nil :overline nil :underline nil :slant normal :weight normal :height 130 :width normal :foundry "PfEd" :family "Source Code Pro")))))

