---
layout: post
title: "Linux操作系统实时性资料"
description: "Real Time Linux"
categories: [linux]
tags: [linux]
redirect_from:
  - /2018/05/07/
---

> Real Time Linux

* Kramdown table of contents
{:toc .toc}
# Real Time Linux

william_yu 2018.05.07 update



## Courses, Lectures and Workshops

- [Real-Time Linux Wiki](https://rt.wiki.kernel.org/index.php/Main_Page)
- [OSADL Project: Realtime Linux](https://www.osadl.org/Realtime-Linux.projects-realtime-linux.0.html)
- [WindRiver](https://education.windriver.com/lmt/windriverlogin.login?site=windriver)

## Blogs

- [Linux操作系统实时性分析](https://blog.csdn.net/lu_embedded/article/details/53572620)

  summarize：

   常用的实时Linux改造方案

  1. 直接修改Linux内核源代码。实时内核补丁网址：www.kernel.org/pub/linux/kernel/projects/rt/。 存在的问题是：难以保证实时进程的执行不会遭到非实时进程所进行的不可预测活动的干扰。
  2. 双内核法。**常用的双内核法实时补丁有RT Linux/GPL、RTAI 和 Xenomai**

- [硬实时Linux(RT-Preempt Patch)在PC上的编译、使用和测试](https://blog.csdn.net/21cnbao/article/details/8038279)

## Code

- [OSADL](https://www.osadl.org/Downloads.downloads.0.html)
- [WIND RIVER LINUX](https://www.windriver.com/products/linux/)
- [Linux/kernel/projects](https://mirrors.edge.kernel.org/pub/linux/kernel/projects/rt/)

## Miscellaneous

- [windriver company](http://networking.ctocio.com.cn/NetInformation/249/7099749.shtml)

## Papers

- [李凡,卢社阶,邱鹏,林爱武.在嵌入式应用中增强Linux实时性的方法研究[J].华中科技大学学报(自然科学版),2005(02):82-85.](http://xueshu.baidu.com/s?wd=paperuri%3A%285193be83a561da2552de1b6ceb1bac64%29&filter=sc_long_sign&tn=SE_xueshusource_2kduw22v&sc_vurl=http%3A%2F%2Fkns.cnki.net%2FKCMS%2Fdetail%2Fdetail.aspx%3Ffilename%3Dhzlg200502027%26dbname%3DCJFD%26dbcode%3DCJFQ&ie=utf-8&sc_us=7393212673502560413) 
- [姚君兰.增强Linux内核实时任务调度性能的研究[J].微计算机信息,2006(14):42-44.](http://kns.cnki.net/KXReader/Detail?dbcode=CJFD&filename=SJSJ201803030&UID=WEEvREcwSlJHSldRa1Fhb09jSnZqRWxrTms0Smp6QlVWL2h1SlNzZExlaz0%3d%249A4hF_YAuvQ5obgVAqNKPCYcEjKensW4ggI8Fm4gTkoUKaID8j8gFw!!&autoLogin=0)
- [王琼.嵌入式Linux系统的实时性改造[J].电脑知识与技术,2010,(22):6229-6230,6249. DOI:10.3969/j.issn.1009-3044.2010.22.042.](http://f.wanfangdata.com.cn/www/%E5%B5%8C%E5%85%A5%E5%BC%8FLinux%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%AE%9E%E6%97%B6%E6%80%A7%E6%94%B9%E9%80%A0.ashx?isread=true&type=perio&resourceId=dnzsyjs-itrzyksb201022042&resourceTitle=%25E5%25B5%258C%25E5%2585%25A5%25E5%25BC%258FLinux%25E7%25B3%25BB%25E7%25BB%259F%25E7%259A%2584%25E5%25AE%259E%25E6%2597%25B6%25E6%2580%25A7%25E6%2594%25B9%25E9%2580%25A0&transaction=%7B%22id%22%3Anull%2C%22transferOutAccountsStatus%22%3Anull%2C%22transaction%22%3A%7B%22id%22%3A%22993508021185286144%22%2C%22status%22%3A1%2C%22createDateTime%22%3Anull%2C%22payDateTime%22%3A1525705745394%2C%22authToken%22%3A%22TGT-4276648-gGXfWepd2TL4MXpfjE4Ga7sATJHYn0cWUJ4gRjM4IwVKDtcQzf-my.wanfangdata.com.cn%22%2C%22user%22%3A%7B%22accountType%22%3A%22Group%22%2C%22key%22%3A%22hzkjdx%22%7D%2C%22transferIn%22%3A%7B%22accountType%22%3A%22Income%22%2C%22key%22%3A%22PeriodicalFulltext%22%7D%2C%22transferOut%22%3A%7B%22GTimeLimit.hzkjdx%22%3A3.0%7D%2C%22turnover%22%3A3.0%2C%22productDetail%22%3A%22perio_dnzsyjs-itrzyksb201022042%22%2C%22productTitle%22%3Anull%2C%22userIP%22%3A%22222.20.36.27%22%2C%22organName%22%3Anull%2C%22memo%22%3Anull%2C%22webTransactionRequest%22%3Anull%2C%22signature%22%3A%22MLjzeP%2BC8zOnylUCatvN8alYrmw17FQruyl9fswTnHbLCl8m%2FXG2cmkOXu2RxRWJ%2Bh7pZn8asMur%5Cn9WKBgybfRjBZYvO%2BYJFSd%2BEBOrQQF0JhPVa9uCcgfWn5OeBAouFMQwZzZKWXZMXJNrGSycAn5%2BLL%5CnX%2B1MduxhE%2BoaLs5JCx8%3D%22%2C%22delete%22%3Afalse%7D%2C%22isCache%22%3Afalse%7D)
- [肖竟华.Linux实时性改造技术研究[J].微机发展,2005,(1):110-112,137. DOI:10.3969/j.issn.1673-629X.2005.01.035.](http://f.wanfangdata.com.cn/www/Linux%E5%AE%9E%E6%97%B6%E6%80%A7%E6%94%B9%E9%80%A0%E6%8A%80%E6%9C%AF%E7%A0%94%E7%A9%B6.ashx?isread=true&type=perio&resourceId=wjfz200501035&resourceTitle=Linux%25E5%25AE%259E%25E6%2597%25B6%25E6%2580%25A7%25E6%2594%25B9%25E9%2580%25A0%25E6%258A%2580%25E6%259C%25AF%25E7%25A0%2594%25E7%25A9%25B6&transaction=%7B%22id%22%3Anull%2C%22transferOutAccountsStatus%22%3Anull%2C%22transaction%22%3A%7B%22id%22%3A%22993508876621975552%22%2C%22status%22%3A1%2C%22createDateTime%22%3Anull%2C%22payDateTime%22%3A1525705949346%2C%22authToken%22%3A%22TGT-4276648-gGXfWepd2TL4MXpfjE4Ga7sATJHYn0cWUJ4gRjM4IwVKDtcQzf-my.wanfangdata.com.cn%22%2C%22user%22%3A%7B%22accountType%22%3A%22Group%22%2C%22key%22%3A%22hzkjdx%22%7D%2C%22transferIn%22%3A%7B%22accountType%22%3A%22Income%22%2C%22key%22%3A%22PeriodicalFulltext%22%7D%2C%22transferOut%22%3A%7B%22GTimeLimit.hzkjdx%22%3A3.0%7D%2C%22turnover%22%3A3.0%2C%22productDetail%22%3A%22perio_wjfz200501035%22%2C%22productTitle%22%3Anull%2C%22userIP%22%3A%22222.20.36.27%22%2C%22organName%22%3Anull%2C%22memo%22%3Anull%2C%22webTransactionRequest%22%3Anull%2C%22signature%22%3A%22VbfsaFR3GJS1q7o%2F0uGvjf8A%2Bzvp0JtfNoVm2F1Lqdq6eJTvPREVM1zb9sVQQS6GvEQHVdCTGvEN%5CnFzjk6NancWl6HS5NKg%2BG0rP8heD%2BiPPIv0sWx2O%2FE2XGc7Z6YbR2KCpUeNRtpHQJtFwNYM5%2BUGXA%5CnK178Xy%2FWq4AMG%2FSJdSg%3D%22%2C%22delete%22%3Afalse%7D%2C%22isCache%22%3Afalse%7D)
- [翟鸿鸣.Linux系统实时性能增强方法的研究[J].微机发展,2003,(z1):1-3,77. DOI:10.3969/j.issn.1673-629X.2003.z1.001.](http://f.wanfangdata.com.cn/www/Linux%E7%B3%BB%E7%BB%9F%E5%AE%9E%E6%97%B6%E6%80%A7%E8%83%BD%E5%A2%9E%E5%BC%BA%E6%96%B9%E6%B3%95%E7%9A%84%E7%A0%94%E7%A9%B6.ashx?isread=true&type=perio&resourceId=wjfz2003z1001&resourceTitle=Linux%25E7%25B3%25BB%25E7%25BB%259F%25E5%25AE%259E%25E6%2597%25B6%25E6%2580%25A7%25E8%2583%25BD%25E5%25A2%259E%25E5%25BC%25BA%25E6%2596%25B9%25E6%25B3%2595%25E7%259A%2584%25E7%25A0%2594%25E7%25A9%25B6&transaction=%7B%22id%22%3Anull%2C%22transferOutAccountsStatus%22%3Anull%2C%22transaction%22%3A%7B%22id%22%3A%22993509921863503872%22%2C%22status%22%3A1%2C%22createDateTime%22%3Anull%2C%22payDateTime%22%3A1525706198551%2C%22authToken%22%3A%22TGT-4276648-gGXfWepd2TL4MXpfjE4Ga7sATJHYn0cWUJ4gRjM4IwVKDtcQzf-my.wanfangdata.com.cn%22%2C%22user%22%3A%7B%22accountType%22%3A%22Group%22%2C%22key%22%3A%22hzkjdx%22%7D%2C%22transferIn%22%3A%7B%22accountType%22%3A%22Income%22%2C%22key%22%3A%22PeriodicalFulltext%22%7D%2C%22transferOut%22%3A%7B%22GTimeLimit.hzkjdx%22%3A3.0%7D%2C%22turnover%22%3A3.0%2C%22productDetail%22%3A%22perio_wjfz2003z1001%22%2C%22productTitle%22%3Anull%2C%22userIP%22%3A%22222.20.36.27%22%2C%22organName%22%3Anull%2C%22memo%22%3Anull%2C%22webTransactionRequest%22%3Anull%2C%22signature%22%3A%22N2cc1jGCKvpcBCHRTSXjz14o2nwLLyU0rwF2LO94xUsImFgOKwzvHKu8NpfKV%2B1BTTlZsi98%2BRRX%5CnsmCZOA3QFDpfJ2rNpf5RuzB%2Fn%2B7ufnHUEykXJ%2FvfzC4ncTJ%2FVhlpY5L4OzSLZNLAxJwxypnrUc6M%5Cnj9eYDHnaUX6NlHRPlf0%3D%22%2C%22delete%22%3Afalse%7D%2C%22isCache%22%3Afalse%7D)

----



## Contributing / Contact

Have anything in mind that you think is awesome and would fit in this list? Feel free to send a pull request.

Feel free to [contact me](mailto:windmillyucong@163.com) anytime for anything.

------



## License

Copyleft! 2018 William Yu
Some rights reserved：CC(creativecommons.org)BY-NC-SA

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

